import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase/compat";
import moment from "moment";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

import RecTutorialMessage from "../../components/RecTutorialMessage";
import ChatBubble from "../../components/ChatBubble";
import ChatMessageSkeleton from "../../components/ChatMessageSkeleton";
import ChatComposer from "../../components/ChatComposer";
import Header3Text from "../../components/typography/Header3Text";

import { db, auth, storage } from "../../provider/Firebase";

const avatarPlaceholderLight = require("../../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../../assets/icons/avatar-placeholder-dark.png");

const HEADER_HEIGHT = 60;

export default function ({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // Users in group chat
  const [message, setMessage] = useState(""); // Text input for message
  const [pendingImages, setPendingImages] = useState([]); // Local URIs picked but not sent yet

  const [loading, setLoading] = useState(true); // Loading state for the page
  const [otherUser, setOtherUser] = useState(); // other user for which to load profile photo
  const [otherImage, setOtherImage] = useState("");
  const [otherUserData, setOtherUserData] = useState(null); // full profile doc, for FullProfile/ChatSettings

  const group = route.params.group;

  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState({});

  const messageRef = db.collection("Groups").doc(group.groupID);

  // Keep track of tutorial state
  const [attendingTutorial, setAttendingTutorial] = useState(false);

  // The safe-area bottom inset (home indicator clearance) only needs to be
  // reserved when the keyboard is hidden — once the keyboard is up it already
  // sits flush with the screen's bottom edge, so keeping that inset as well
  // left a visible gap between the input row and the keyboard.
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
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
        setMessages([]);
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

  const uploadImageToStorage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);

    const ref = storage.ref().child('groups/' + group.groupID + '/' + filename);
    const uploadTask = await ref.put(blob, {
      contentType: 'image/jpeg',
    });

    return uploadTask.ref.getDownloadURL();
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
    if (!canSend) return;

    const imagesToSend = pendingImages;
    const textToSend = message.trim();
    setPendingImages([]);
    setMessage("");

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
      console.error("Failed to send message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  // TUTORIAL FUNCTIONS

  // Fetch data from Firestore to see if the user has seen the tutorial before or not
  useEffect(() => {
    const fetchData = async () => {
      const docRef = db.collection('Users').doc(user.uid);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();

        if (data.settings?.attendingTutorial !== undefined) {
          setAttendingTutorial(data.settings.attendingTutorial);
        }
      }
    };

    fetchData();
  }, []);

  const chatStep = [
    {
      title: 'Meal Chat',
      content: 'It can be hard to find each other for the first time when the meetup starts. These following topics can help: Which table you’re sitting at, what clothes you’re wearing today, how far away you are from the location, etc.',
      enableNext: true,
      goHome: true,
      bottom: "5%",
    },
  ];

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const canSend = message.trim().length > 0 || pendingImages.length > 0;

  return (
    <Layout>
      {attendingTutorial &&
        <RecTutorialMessage
          userId={user.uid}
          title={chatStep[0].title}
          content={chatStep[0].content}
          bottom={chatStep[0].bottom}
          navigation={navigation}
          goHome={chatStep[0].goHome}
        />
      }

      <View style={[styles.header, { backgroundColor: tokens.background, borderBottomColor: tokens.containerMedium }]}>
        <TouchableOpacity onPress={() => {
          // Temporary fix with invalid chat preview, to be fixed in the future for better speed.
          navigation.navigate("Chats");
        }} hitSlop={8}>
          <Ionicons name="arrow-back" size={23} color={tokens.onBackground} />
        </TouchableOpacity>

        <View style={styles.centerAbsolute} pointerEvents="box-none">
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
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ChatSettings", { group, otherUser: otherUserData, otherImage })
          }
          hitSlop={8}
        >
          <Ionicons name="ellipsis-horizontal-circle-outline" size={23} color={tokens.onBackground} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            renderItem={({ item }) => <ChatBubble {...item} navigation={navigation} />}
            inverted={true}
            keyExtractor={(item) => item.sentAt.toString()}
            contentContainerStyle={styles.messageList}
          />
        )}

        <View
          style={[
            styles.inputRow,
            {
              paddingBottom: keyboardVisible
                ? 10
                : Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 5 : 0),
            },
          ]}
        >
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
            disabled={!canSend}
          >
            <Ionicons name="paper-plane" size={20} color={tokens.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
});
