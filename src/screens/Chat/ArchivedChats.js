//List of chats the user has archived out of their main Inbox

import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Layout } from "../../rapi_ui_components";

import ChatPreview from "../../components/ChatPreview";
import ChatPreviewSkeleton from "../../components/ChatPreviewSkeleton";
import SmallAppBar from "../../components/SmallAppBar";
import useChatGroups from "./useChatGroups";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

export default function ArchivedChats({ navigation }) {
  const user = firebase.auth().currentUser;
  const { groups, setGroups, loading } = useChatGroups(user, { archived: true });

  const handleDeleteChat = (groupID) => {
    const previousGroups = groups;
    setGroups((prev) => prev.filter((group) => group.groupID !== groupID));
    db.collection("Users")
      .doc(user.uid)
      .update({
        groupIDs: firebase.firestore.FieldValue.arrayRemove(groupID),
        archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(groupID),
      })
      .catch((error) => {
        console.error("Failed to delete chat:", error);
        setGroups(previousGroups);
        alert("Couldn't delete this chat: " + error.message);
      });
  };

  const handleUnarchiveChat = (groupID) => {
    const previousGroups = groups;
    setGroups((prev) => prev.filter((group) => group.groupID !== groupID));
    db.collection("Users")
      .doc(user.uid)
      .update({
        archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(groupID),
      })
      .catch((error) => {
        console.error("Failed to unarchive chat:", error);
        setGroups(previousGroups);
        alert("Couldn't unarchive this chat: " + error.message);
      });
  };

  return (
    <Layout>
      <SmallAppBar title="Archived chats" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.chats}>
            {Array.from({ length: 7 }).map((_, index) => (
              <ChatPreviewSkeleton key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.chats}
            keyExtractor={(item) => item.groupID}
            data={groups}
            renderItem={({ item }) => (
              <ChatPreview
                group={item}
                onPress={() => {
                  navigation.navigate("ChatRoom", { group: item });
                }}
                onDelete={() => handleDeleteChat(item.groupID)}
                archiveAction={{
                  label: "Unarchive chat",
                  icon: "arrow-undo-outline",
                  onPress: () => handleUnarchiveChat(item.groupID),
                }}
              />
            )}
          />
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 10,
  },
  chats: {
    paddingHorizontal: 20,
  },
});
