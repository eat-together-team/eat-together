//Chat with users you have already connected with

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
} from "react-native";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import ChatPreview from "../../components/ChatPreview";
import ChatPreviewSkeleton from "../../components/ChatPreviewSkeleton";
import Searchbar from "../../components/Searchbar";
import SmallTextButton from "../../components/SmallTextButton";
import LargeAppBar from "../../components/LargeAppBar";
import Header3Text from "../../components/typography/Header3Text";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

export const createNewChat = (
  userIDs,
  chatID,
  chatName,
  toIncludeOnChatPage
) => {
  // Create a new doc in the groups collection on firestore with input
  db.collection("Groups").doc(chatID).set({
    uids: userIDs,
    name: chatName,
    messages: []
  });
  // If we want to display this chat on the chat page, update each user's data to include this chat
  if (toIncludeOnChatPage) {
    userIDs.map((uid) => {
      db.collection("Users")
        .doc(uid)
        .update({
          groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
        });
    });
  }
};

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const [groups, setGroups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  // Current user
  const user = firebase.auth().currentUser;

  const [loading, setLoading] = useState(true); // Loading state for the page
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      contentOpacity.setValue(0);
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  useEffect(() => {
    db.collection("Users").doc(user.uid).update({
      hasUnreadMessages: false
    });

    db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        const nameCurrent = doc.data().firstName + " " + doc.data().lastName;
        const groups = doc.data().groupIDs;

        // update the groups displayed
        let temp = [];
        let lenGroups = groups.length;

        if (lenGroups === 0) {
          setGroups([]);
          setLoading(false);
        }

        groups.forEach((groupID) => {
          db.collection("Groups")
            .doc(groupID)
            .get()
            .then((doc) => {
              // now store all the chat rooms
              let data = doc.data();
              // store most recent message in variable

              let message = "";
              let unread = false;

              if (data.messages.length > 0) {
                const lastMessage = data.messages[data.messages.length - 1];
                message = lastMessage.message;
                if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
                  unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
                }
              }

              let time =
                data.messages.length != 0
                  ? data.messages[data.messages.length - 1].sentAt
                  : "";

              // Get rid of your own name and all the ways it can be formatted in group title (if it is a DM)
              let name = data.name;
              if (data.uids.length >= 2) {
                name = name.replace(nameCurrent + ", ", "");
                if (name.endsWith(", " + nameCurrent)) {
                  name = name.slice(0, -1 * (nameCurrent.length + 2));
                }
              }

              // For a 1-on-1 chat, use the other person's own profile photo
              // (same lookup ChatRoom.js uses) instead of a group photo, since
              // group docs are never actually given one.
              const otherUids = data.uids.filter((uid) => uid !== user.uid);
              const avatarLookup =
                otherUids.length === 1
                  ? db
                      .collection("Users")
                      .doc(otherUids[0])
                      .get()
                      .then((userDoc) => {
                        const userData = userDoc.data();
                        return userData && userData.hasImage
                          ? userData.image
                          : null;
                      })
                  : Promise.resolve(null);

              return avatarLookup.then((avatarUri) => {
                temp.push({
                  groupID: groupID,
                  name: name,
                  uids: data.uids,
                  hasImage: data.hasImage,
                  message: message,
                  unread: unread,
                  time: time,
                  pictureID: data.id,
                  avatarUri: avatarUri,
                });
              });
            })
            .then(() => {
              lenGroups--;
              if (lenGroups === 0) {
                // sort display by time
                temp.sort((a, b) => {
                  return b.time - a.time;
                });
                setGroups(temp);
                setLoading(false);
              }
            });
        });
      }
    });

    // --- FRIEND REQUESTS LISTENER (for the "Requests (N)" button) ---
    const unsubscribeRequests = db
      .collection("User Invites")
      .doc(user.uid)
      .collection("Connections")
      .onSnapshot((querySnapshot) => {
        setRequests(querySnapshot.docs);
      });

    return () => unsubscribeRequests();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Layout>
      <LargeAppBar
        title="Inbox"
        actions={[
          { icon: "pencil-outline", onPress: () => navigation.navigate("GroupChat") },
          { icon: "archive-outline", onPress: () => alert("Archived chats are coming soon!") },
        ]}
      />

      <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />

      <View style={styles.messagesRow}>
        <Header3Text color={tokens.onBackground}>Messages</Header3Text>
        {requests.length > 0 && (
          <SmallTextButton
            text={`Requests (${requests.length})`}
            onPress={() => navigation.navigate("Requests")}
          />
        )}
      </View>

      <View style={styles.content}>
        {loading ?
          <View style={styles.chats}>
            {Array.from({ length: 7 }).map((_, index) => (
              <ChatPreviewSkeleton key={index} />
            ))}
          </View>
        :
          <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
            <FlatList
              contentContainerStyle={styles.chats}
              keyExtractor={(item) => item.groupID}
              data={filteredGroups}
              renderItem={({ item }) => (
                <ChatPreview
                  group={item}
                  onPress={() => {
                    navigation.navigate("ChatRoom", {
                      group: item,
                    });
                  }}
                />
              )}
            />
          </Animated.View>
        }
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  messagesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  content: {
    flex: 1
  },
  chats: {
    paddingHorizontal: 20,
  },
});
