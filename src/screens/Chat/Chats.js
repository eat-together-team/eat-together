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
import useChatGroups from "./useChatGroups";
import useDeferredReady from "../../utils/useDeferredReady";

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

// Deletes a chat from the current user's perspective. A 1-on-1 chat is
// removed outright — once you're gone there's no other stakeholder left to
// keep it around for, same as the cleanup already done when blocking a user
// (see databaseStoreBlockAction in FullProfile.js). A group chat just drops
// the current user from it, leaving everyone else's copy intact. Without
// this distinction, "deleting" a 1-on-1 chat only unlinked it from your own
// groupIDs — the Groups doc (and all its messages) stuck around forever, so
// starting a "new" chat with that same person just reopened the old thread
// instead of actually starting fresh.
export const deleteChat = (user, group) => {
  const cleanup =
    group.uids.length === 2
      ? db
          .collection("Groups")
          .doc(group.groupID)
          .delete()
          .then(() => {
            const otherUid = group.uids.find((uid) => uid !== user.uid);
            if (!otherUid) return;
            return db
              .collection("Users")
              .doc(otherUid)
              .update({
                groupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
                archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
              });
          })
      : db
          .collection("Groups")
          .doc(group.groupID)
          .update({
            uids: firebase.firestore.FieldValue.arrayRemove(user.uid),
          });

  return Promise.all([
    cleanup,
    db
      .collection("Users")
      .doc(user.uid)
      .update({
        groupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
        archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(group.groupID),
      }),
  ]);
};

export default function ({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  // Current user
  const user = firebase.auth().currentUser;

  const ready = useDeferredReady();
  const { groups, setGroups, loading } = useChatGroups(user, { archived: false, enabled: ready });
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
    if (!ready) return;

    db.collection("Users").doc(user.uid).update({
      hasUnreadMessages: false
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
  }, [ready]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleDeleteChat = (groupID) => {
    const group = groups.find((g) => g.groupID === groupID);
    const previousGroups = groups;
    setGroups((prev) => prev.filter((g) => g.groupID !== groupID));
    deleteChat(user, group).catch((error) => {
      console.error("Failed to delete chat:", error);
      setGroups(previousGroups);
      alert("Couldn't delete this chat: " + error.message);
    });
  };

  const handleArchiveChat = (groupID) => {
    const previousGroups = groups;
    setGroups((prev) => prev.filter((group) => group.groupID !== groupID));
    db.collection("Users")
      .doc(user.uid)
      .update({
        archivedGroupIDs: firebase.firestore.FieldValue.arrayUnion(groupID),
      })
      .catch((error) => {
        console.error("Failed to archive chat:", error);
        setGroups(previousGroups);
        alert("Couldn't archive this chat: " + error.message);
      });
  };

  return (
    <Layout>
      <LargeAppBar
        title="Inbox"
        actions={[
          { icon: "pencil-outline", onPress: () => navigation.navigate("NewChat") },
          { icon: "archive-outline", onPress: () => navigation.navigate("ArchivedChats") },
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
                  onDelete={() => handleDeleteChat(item.groupID)}
                  archiveAction={{
                    label: "Archive chat",
                    icon: "archive-outline",
                    onPress: () => handleArchiveChat(item.groupID),
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
