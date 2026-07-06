//List of chats the user has archived out of their main Inbox

import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import ChatPreview from "../../components/ChatPreview";
import ChatPreviewSkeleton from "../../components/ChatPreviewSkeleton";
import SmallAppBar from "../../components/SmallAppBar";
import Header3Text from "../../components/typography/Header3Text";
import useChatGroups from "./useChatGroups";
import useDeferredReady from "../../utils/useDeferredReady";
import { deleteChat, addSystemMessage } from "./Chats";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

// Figma export (archive.svg) — stroke color is passed in rather than baked
// in as the exported #BBBBBB so it can adapt to light/dark theme.
const EmptyArchiveIcon = ({ size = 59, color }) => (
  <Svg width={size} height={size} viewBox="0 0 59 59" fill="none">
    <Path
      d="M9.21875 17.5166V47.0166C9.2224 48.238 9.7092 49.4083 10.5728 50.2719C11.4365 51.1355 12.6068 51.6223 13.8281 51.626H45.1719C46.3932 51.6223 47.5635 51.1355 48.4272 50.2719C49.2908 49.4083 49.7776 48.238 49.7813 47.0166V17.5166"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M50.2449 7.37378H8.7605C6.97852 7.37378 5.53394 8.81836 5.53394 10.6003V13.366C5.53394 15.1479 6.97852 16.5925 8.7605 16.5925H50.2449C52.0269 16.5925 53.4714 15.1479 53.4714 13.366V10.6003C53.4714 8.81836 52.0269 7.37378 50.2449 7.37378Z"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <Path
      d="M36.88 35.0303L29.504 42.4063L22.1279 35.0303"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M29.501 39.8602V25.8123"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ArchivedChats({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = firebase.auth().currentUser;
  const ready = useDeferredReady();
  const { groups, setGroups, loading } = useChatGroups(user, { archived: true, enabled: ready });

  const handleDeleteChat = (groupID) => {
    const group = groups.find((g) => g.groupID === groupID);
    const previousGroups = groups;
    setGroups((prev) => prev.filter((g) => g.groupID !== groupID));

    // Same "Leave group" semantics as Chats.js's inbox swipe — an archived
    // group chat still only ever removes you from it on swipe, so it gets
    // the same "X left the chat" system message, posted first so this user
    // still has normal member write access at the moment it's added.
    const isGroupChat = group.uids.length > 2;
    const cleanup = isGroupChat
      ? db
          .collection("Users")
          .doc(user.uid)
          .get()
          .then((doc) => addSystemMessage(groupID, `${doc.data()?.firstName} left the chat`))
          .then(() => deleteChat(user, group))
      : deleteChat(user, group);

    cleanup.catch((error) => {
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
            contentContainerStyle={[styles.chats, groups.length === 0 && styles.chatsEmpty]}
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
                  label: "Move to inbox",
                  icon: "mail",
                  onPress: () => handleUnarchiveChat(item.groupID),
                }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <EmptyArchiveIcon color={tokens.textLight} />
                <Header3Text color={tokens.textLight} center>
                  {"You don't have any\narchived chats"}
                </Header3Text>
              </View>
            }
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
  chatsEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
