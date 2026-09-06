import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
// The main "expo-file-system" entry point in this SDK version only exposes
// deprecated stubs that throw at runtime (readAsStringAsync et al. were
// moved to a new File/Directory class API) — the actual working functions
// still live under the /legacy subpath. iOS-only: see uploadImageToStorage.
import * as FileSystem from "expo-file-system/legacy";
// Android-only. @react-native-firebase/storage uploads through the real
// native Android Firebase SDK, which is what actually fixes the Android
// upload hang — firebase/compat's Storage (browser-style Blob/XHR
// polyfills) is a well-documented source of exactly that hang on Android.
// iOS never had this problem, so it stays on firebase/compat below rather
// than paying for the native module there too (see uploadImageToStorage).
// Lazily required, not statically imported: this package is excluded from
// iOS autolinking, so a top-level import would try to reach the native
// module at import time on iOS too and crash before Platform.OS is checked.
const nativeStorage = () => require("@react-native-firebase/storage").default();
import firebase from "firebase/compat";
import moment from "moment";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

import ChatBubble from "../../components/ChatBubble";
import SystemMessage from "../../components/SystemMessage";
import ChatMessageSkeleton from "../../components/ChatMessageSkeleton";
import ChatComposer from "../../components/ChatComposer";
import Header3Text from "../../components/typography/Header3Text";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";
import getDate from "../../utils/getDate";
import getTime from "../../utils/getTime";
import { deleteChat, acceptMessageRequest } from "./Chats";

import { db, auth, storage } from "../../provider/Firebase";

const avatarPlaceholderLight = require("../../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../../assets/icons/avatar-placeholder-dark.png");

const HEADER_HEIGHT = 60;

// iOS's KeyboardAvoidingView already works well with behavior="padding".
// Android's does not — `behavior` is a no-op there — so this swaps in a
// plain Animated.View driven by the keyboard's own reported height instead
// (see the androidKeyboardHeight effect above).
const KeyboardWrapper = ({ androidKeyboardHeight, children }) =>
  Platform.OS === "ios" ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      {children}
    </KeyboardAvoidingView>
  ) : (
    <Animated.View style={{ flex: 1, paddingBottom: androidKeyboardHeight }}>
      {children}
    </Animated.View>
  );

export default function ({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // Users in group chat
  // Seeded from route params (set when NewChat.js just created the request,
  // so the very first render already knows) — the live snapshot below keeps
  // both in sync with the doc from then on (e.g. flips to false on accept).
  const [pending, setPending] = useState(route.params.group.pending || false);
  const [requestedBy, setRequestedBy] = useState(route.params.group.requestedBy || null);
  const [message, setMessage] = useState(""); // Text input for message
  const [pendingImages, setPendingImages] = useState([]); // Local URIs picked but not sent yet
  const [sending, setSending] = useState(false); // True while an upload/send is in flight

  const [loading, setLoading] = useState(true); // Loading state for the page
  const [otherUser, setOtherUser] = useState(); // other user for which to load profile photo
  const [otherImage, setOtherImage] = useState("");
  const [otherUserData, setOtherUserData] = useState(null); // full profile doc, for FullProfile/ChatSettings
  // uid -> { firstName, image } for every group member — the header
  // subtitle's roster and each ChatBubble's per-sender name/avatar both
  // read from this one map instead of two separate fetches.
  const [memberInfoByUid, setMemberInfoByUid] = useState({});
  // Group chats default to "New group" at creation (see NewChat.js) and can
  // be renamed later from GroupSettings.js — tracked live here rather than
  // hardcoded so a rename shows up immediately.
  const [groupName, setGroupName] = useState(route.params.group.name);

  const group = route.params.group;
  // An event's chat (see startEventChat in Chats.js) always gets the group
  // chat treatment — name/settings/roster — even while it only has one or
  // two members, since it's conceptually tied to the event rather than to
  // whoever happens to be in it at the moment.
  const isEventChat = !!group.eventID;

  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState({});

  const messageRef = db.collection("Groups").doc(group.groupID);

  // The safe-area bottom inset (home indicator clearance) only needs to be
  // reserved when the keyboard is hidden — once the keyboard is up it already
  // sits flush with the screen's bottom edge, so keeping that inset as well
  // left a visible gap between the input row and the keyboard.
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Android has no built-in KeyboardAvoidingView support at all (behavior is
  // a no-op there) — we tried react-native-keyboard-controller for a real
  // fix, but this project's react-native-reanimated/worklets combo crashes
  // on any code path that touches worklets, so that's off the table. This
  // manually tracks the keyboard's own reported height and animates it as
  // bottom padding instead, using only core Animated (no reanimated).
  const androidKeyboardHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      if (Platform.OS === "android") {
        // Some keyboards (e.g. Gboard with its suggestion/toolbar strip)
        // report a height that's a bit shorter than what's actually visible
        // above the keys, which left the composer slightly tucked under the
        // keyboard's top edge — this small buffer covers that gap.
        Animated.timing(androidKeyboardHeight, {
          toValue: (e.endCoordinates?.height ?? 0) + 26,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      if (Platform.OS === "android") {
        Animated.timing(androidKeyboardHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // On update, push messages
  useEffect(() => {
    db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      setUserInfo(doc.data());
    });

    messageRef.onSnapshot((doc) => {
      if (doc.data()) { // Checks if doc exists (used to prevent crash after blocking a user)
        setUsers(doc.data().uids); // Users in group
        setPending(doc.data().pending || false);
        setRequestedBy(doc.data().requestedBy || null);
        if (doc.data().uids.length > 2 || isEventChat) setGroupName(doc.data().name);

        const otherUsers = doc.data().uids.filter(u => u !== user.uid)
        setOtherUser(otherUsers[0])

        const docMessages = doc.data().messages || [];
        let temp = [];
        docMessages.forEach((message, index) => {
          let messageObj = {
            ...message,
            nextMessage: docMessages[index + 1] || null, // fetches the next message
            prevMessage: docMessages[index - 1] || null,
          }

          // insert message at beginning of array
          temp.unshift(messageObj);
        });

        setMessages(temp);

        // setRead does a full-array overwrite of the messages field, which
        // races with the arrayUnion write our own sendMessage() does — if
        // this fired after every snapshot (including the one immediately
        // following our own send), it could clobber a message we just sent
        // before it was durably persisted, since a "just sent" message has
        // no unread-for-me entry to flip. Only bother when this user
        // actually has something unread to mark, i.e. an incoming message.
        const hasUnreadForMe = docMessages.some(
          (m) => Array.isArray(m.unread) && m.unread.some((u) => u.uid === user.uid && u.unread)
        );
        if (hasUnreadForMe) {
          setRead(temp);
        }
      } else {
        // Doc's gone (declined/withdrawn, or blocked) — nothing left to be
        // pending about, so reset these too rather than leaving them stale
        // and rendering a pending-request footer against an empty message
        // list.
        setMessages([]);
        setPending(false);
        setRequestedBy(null);
      }
      // Resolve loading regardless of whether the doc has any messages yet
      // (or briefly doesn't exist, e.g. right after blocking a user) — a
      // chat with zero messages should render as a blank message list, not
      // stay stuck on the loading skeleton forever.
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (otherUser) {
      db.collection("Users").doc(otherUser).get()
      .then((doc) => {
        setOtherImage(doc.data().image);
        setOtherUserData({ id: otherUser, ...doc.data() });
      })
    }
  }, [otherUser]);

  // Group chats (3+ people, or any event chat regardless of size) show the
  // group's name (see groupName state) with a member roster underneath
  // instead of one other person's name/photo — there's no single "other
  // person" to link a profile-photo header to.
  useEffect(() => {
    const uids = users.length > 0 ? users : group.uids;
    if (uids.length <= 2 && !isEventChat) return;

    // Firestore 'in' queries cap at 10 values, so chunk larger rosters.
    const chunks = [];
    for (let i = 0; i < uids.length; i += 10) chunks.push(uids.slice(i, i + 10));

    Promise.all(
      chunks.map((chunk) =>
        db.collection("Users").where(firebase.firestore.FieldPath.documentId(), "in", chunk).get()
      )
    ).then((snapshots) => {
      const info = {};
      snapshots.forEach((snapshot) =>
        snapshot.forEach((doc) => {
          const data = doc.data();
          info[doc.id] = { firstName: data.firstName, image: data.hasImage ? data.image : null };
        })
      );
      setMemberInfoByUid(info);
    });
  }, [users, group.uids]);

  // Tapping the image button opens the gallery directly — images are staged
  // as previews in the composer rather than uploaded/sent immediately, so
  // multiple can be picked (and individually removed) before the user
  // actually hits send.
  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      setPendingImages((prev) => [...prev, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const removePendingImage = (index) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // firebase/compat's Storage upload goes through browser-style Blob/XHR
  // polyfills that are a well-documented source of upload hangs on Android
  // specifically (sits at 0% forever, no error) — iOS never had this
  // problem. So this is split by platform rather than migrating both to the
  // native module: Android uses @react-native-firebase/storage (uploads
  // through the real native Android Firebase SDK, sidestepping the Blob/XHR
  // issue entirely — putFile() takes the local file URI directly, no JS-side
  // reading/encoding step at all), iOS keeps the original firebase/compat
  // path that already worked fine there (base64 read via expo-file-system,
  // uploaded with putString).
  const uploadImageToStorage = (uri, onProgress) => {
    if (Platform.OS === "android") {
      return new Promise((resolve, reject) => {
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const reference = nativeStorage().ref('groups/' + group.groupID + '/' + filename);
        const uploadTask = reference.putFile(uri, { contentType: 'image/jpeg' });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes);
          },
          (error) => reject(error),
          () => {
            reference.getDownloadURL().then(resolve).catch(reject);
          }
        );
      });
    }

    return new Promise((resolve, reject) => {
      FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 })
        .then((base64) => {
          const filename = uri.substring(uri.lastIndexOf('/') + 1);
          const ref = storage.ref().child('groups/' + group.groupID + '/' + filename);
          const uploadTask = ref.putString(base64, 'base64', { contentType: 'image/jpeg' });

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes);
            },
            (error) => reject(error),
            () => {
              uploadTask.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
            }
          );
        })
        .catch(reject);
    });
  };

  // Set all messages to read
  const setRead = (messages) => {
    let temp = [];

    messages.forEach(message => {
      if (message.unread) {
        let newMessage = message;
        let unread = newMessage.unread.filter(u => u.uid === user.uid);

        if (unread.length > 0) {
          unread[0].unread = false;
        }

        temp.unshift(newMessage);
      } else {
        temp.unshift(message);
      }
    });

    messageRef.update({
      messages: temp
    });
  }

  // Appends a single message (text and/or image) to the group doc. sentAt is
  // passed in explicitly rather than computed here so a batch of messages
  // sent together (e.g. several images followed by a caption) can each get a
  // distinct, increasing timestamp instead of racing to the same unix second
  // (messages are keyed by sentAt in the FlatList).
  const sendMessage = ({ text = "", url = null, sentAt }) => {
    let unread = [];
    users.forEach((uid) => {
      if (uid != user.uid) {
        unread.push({
          uid: uid,
          unread: true,
        });
      }
    });

    return messageRef
      .update({
        messages: firebase.firestore.FieldValue.arrayUnion({
          message: text,
          sentAt: sentAt,
          sentBy: user.uid,
          sentName: userInfo.firstName + " " + userInfo.lastName.substring(0, 1) + ".",
          unread: unread,
          url: url,
        }),
      })
      .then(() => {
        users.forEach((uid) => {
          if (uid != user.uid) {
            db.collection("Users").doc(uid).update({
              hasUnreadMessages: true
            });
          }
        });
      });
  };

  const handleSend = async () => {
    if (!canSend || sending) return;

    const imagesToSend = pendingImages;
    const textToSend = message.trim();
    setPendingImages([]);
    setMessage("");
    setSending(true);

    try {
      let sentAt = moment().unix();
      if (imagesToSend.length > 0) {
        // A typed caption rides along with the last image as one combined
        // message (image + caption in a single bubble) rather than as its
        // own separate trailing text message.
        for (let i = 0; i < imagesToSend.length; i++) {
          const downloadURL = await uploadImageToStorage(imagesToSend[i]);
          const isLastImage = i === imagesToSend.length - 1;
          await sendMessage({
            url: downloadURL,
            text: isLastImage ? textToSend : "",
            sentAt: sentAt,
          });
          sentAt += 1;
        }
      } else if (textToSend) {
        await sendMessage({ text: textToSend, sentAt: sentAt });
      }
    } catch (error) {
      // Surface the actual underlying reason (e.g. a Storage security-rule
      // rejection has error.code "storage/unauthorized") instead of a
      // generic message — a failed send previously just disappeared with no
      // indication of why.
      console.error("Failed to send message:", error);
      Alert.alert(
        "Couldn't send message",
        [error.code, error.message].filter(Boolean).join("\n") || "Something went wrong."
      );
    } finally {
      setSending(false);
    }
  };

  // A still-pending chat (message request) shows a different footer instead
  // of the normal composer, depending on which side of the request this
  // user is on — see the render below for exactly which state renders what.
  const isPendingSender = pending && requestedBy === user.uid;
  const isPendingReceiver =
    pending && requestedBy !== null && requestedBy !== user.uid && messages.length > 0;
  const requestGroup = { groupID: group.groupID, uids: users.length ? users : group.uids };
  const groupUids = users.length > 0 ? users : group.uids;
  const isGroupChat = groupUids.length > 2 || isEventChat;
  const groupMemberNames = groupUids.map((uid) => memberInfoByUid[uid]?.firstName).filter(Boolean);
  const groupSubtitle =
    groupMemberNames.slice(0, 2).join(", ") +
    (groupMemberNames.length > 2 ? `, +${groupMemberNames.length - 2}` : "");

  const handleWithdraw = async () => {
    try {
      await deleteChat(user, requestGroup);
      navigation.navigate("Chats");
    } catch (error) {
      console.error("Failed to withdraw request:", error);
      Alert.alert("Couldn't withdraw request", error.message || "Something went wrong.");
    }
  };

  const handleDecline = async () => {
    try {
      await deleteChat(user, requestGroup);
      navigation.navigate("Chats");
    } catch (error) {
      console.error("Failed to decline request:", error);
      Alert.alert("Couldn't decline request", error.message || "Something went wrong.");
    }
  };

  const handleAccept = async () => {
    try {
      await acceptMessageRequest(user, requestGroup);
    } catch (error) {
      console.error("Failed to accept request:", error);
      Alert.alert("Couldn't accept request", error.message || "Something went wrong.");
    }
  };

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const canSend = message.trim().length > 0 || pendingImages.length > 0;
  const bottomPadding = keyboardVisible
    ? 10
    : Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 5 : 0);

  return (
    <Layout>
      <View style={[styles.header, { backgroundColor: tokens.background, borderBottomColor: tokens.containerMedium }]}>
        <TouchableOpacity onPress={() => {
          // Temporary fix with invalid chat preview, to be fixed in the future for better speed.
          navigation.navigate("Chats");
        }} hitSlop={8}>
          <Ionicons name="arrow-back" size={23} color={tokens.onBackground} />
        </TouchableOpacity>

        <View style={styles.centerAbsolute} pointerEvents="box-none">
          {isGroupChat ? (
            <View style={styles.groupHeaderCenter}>
              <Header3Text color={tokens.onBackground} numberOfLines={1} center>
                {groupName}
              </Header3Text>
              <SubBodyText
                color={tokens.textMedium}
                numberOfLines={1}
                ellipsizeMode="tail"
                center
              >
                {groupSubtitle}
              </SubBodyText>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.headerCenter}
              onPress={() => navigation.navigate("FullProfile", { person: otherUserData })}
              disabled={!otherUserData}
            >
              <Image
                source={otherImage ? { uri: otherImage } : undefined}
                placeholder={avatarPlaceholder}
                placeholderContentFit="cover"
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
                style={styles.avatar}
              />
              <Header3Text
                color={tokens.onBackground}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.headerName}
              >
                {group.name}
              </Header3Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() =>
            isGroupChat
              ? navigation.navigate("GroupSettings", { group: requestGroup, name: groupName })
              : navigation.navigate("ChatSettings", { group, otherUser: otherUserData, otherImage })
          }
          hitSlop={8}
        >
          <Ionicons name="ellipsis-horizontal-circle-outline" size={23} color={tokens.onBackground} />
        </TouchableOpacity>
      </View>

      <KeyboardWrapper androidKeyboardHeight={androidKeyboardHeight}>
        {loading ? (
          <View style={styles.skeletonList}>
            <ChatMessageSkeleton align="left" />
            <ChatMessageSkeleton align="right" />
            <ChatMessageSkeleton align="left" />
            <ChatMessageSkeleton align="right" />
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={({ item }) =>
              item.type === "system" ? (
                <SystemMessage text={item.text} sentAt={item.sentAt} />
              ) : (
                <ChatBubble
                  {...item}
                  navigation={navigation}
                  isGroupChat={isGroupChat}
                  senderImage={memberInfoByUid[item.sentBy]?.image}
                />
              )
            }
            inverted={true}
            keyExtractor={(item) => item.sentAt.toString()}
            contentContainerStyle={styles.messageList}
          />
        )}

        {isPendingReceiver ? (
          // Not accepted yet, viewed from the recipient's side — no
          // composer at all until they act on it.
          <View style={[styles.requestFooter, { paddingBottom: bottomPadding }]}>
            <SubBodyText color={tokens.textNormal} center>
              {group.name} requested to message you
            </SubBodyText>
            <SubBodyText color={tokens.textLight} center style={styles.requestTimestamp}>
              {getDate(moment.unix(messages[0].sentAt).toDate(), false)} ·{" "}
              {getTime(moment.unix(messages[0].sentAt).toDate())}
            </SubBodyText>
            <View style={styles.requestButtonsRow}>
              <TouchableOpacity
                style={[styles.requestButton, { borderWidth: 2, borderColor: tokens.error }]}
                onPress={handleDecline}
              >
                <Header4Text color={tokens.error}>Decline</Header4Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.requestButton, { borderWidth: 2, borderColor: tokens.primary }]}
                onPress={handleAccept}
              >
                <Header4Text color={tokens.primary}>Accept</Header4Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isPendingSender && messages.length > 0 ? (
          // The sender's one allowed message has already gone out — no more
          // composer until the other side accepts (or they withdraw it).
          <View style={[styles.requestFooter, { paddingBottom: bottomPadding }]}>
            <SubBodyText color={tokens.textNormal} center>
              You requested to message {group.name}
            </SubBodyText>
            <SubBodyText color={tokens.textLight} center style={styles.requestTimestamp}>
              {getDate(moment.unix(messages[0].sentAt).toDate(), false)} ·{" "}
              {getTime(moment.unix(messages[0].sentAt).toDate())}
            </SubBodyText>
            <TouchableOpacity
              style={[styles.withdrawButton, { borderColor: tokens.outline }]}
              onPress={handleWithdraw}
            >
              <Header4Text color={tokens.textMedium}>Withdraw request</Header4Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Normal composer — also what a pending sender sees for their one
          // allowed message, before they've sent it.
          <View style={[styles.inputRow, { paddingBottom: bottomPadding }]}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: tokens.containerHigh }]}
              onPress={handleChoosePhoto}
            >
              <Ionicons name="images" size={22} color={tokens.onBackground} />
            </TouchableOpacity>

            <ChatComposer
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              attachments={pendingImages}
              onRemoveAttachment={removePendingImage}
            />

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: tokens.primary, opacity: canSend ? 1 : 0.5 }]}
              onPress={handleSend}
              disabled={!canSend || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={tokens.onPrimary} />
              ) : (
                <Ionicons name="paper-plane" size={20} color={tokens.onPrimary} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardWrapper>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 25,
  },
  centerAbsolute: {
    position: "absolute",
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    maxWidth: "100%",
  },
  groupHeaderCenter: {
    alignItems: "center",
    maxWidth: "100%",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  headerName: {
    flexShrink: 1,
  },
  skeletonList: {
    flex: 1,
    justifyContent: "flex-end",
    paddingVertical: 20,
  },
  messageList: {
    paddingVertical: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 11,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    width: 47,
    height: 47,
    borderRadius: radiusTokens.small,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
  },
  requestFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 4,
  },
  requestTimestamp: {
    marginBottom: 20,
  },
  requestButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  requestButton: {
    flex: 1,
    borderRadius: radiusTokens.small,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawButton: {
    borderWidth: 2,
    borderRadius: radiusTokens.small + 3,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
