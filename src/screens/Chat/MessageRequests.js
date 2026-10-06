//List of message requests from people you haven't accepted a chat with yet

import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import ChatPreview from "../../components/ChatPreview";
import ChatPreviewSkeleton from "../../components/ChatPreviewSkeleton";
import SmallAppBar from "../../components/SmallAppBar";
import Header3Text from "../../components/typography/Header3Text";
import useChatGroups from "./useChatGroups";
import useDeferredReady from "../../utils/useDeferredReady";
import { deleteChat } from "./Chats";

import firebase from "firebase/compat";

export default function MessageRequests({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = firebase.auth().currentUser;
  const ready = useDeferredReady();
  const { groups, setGroups, loading } = useChatGroups(user, { pending: true, enabled: ready });

  const handleDeclineRequest = (groupID) => {
    const group = groups.find((g) => g.groupID === groupID);
    const previousGroups = groups;
    setGroups((prev) => prev.filter((g) => g.groupID !== groupID));
    deleteChat(user, group).catch((error) => {
      console.error("Failed to decline message request:", error);
      setGroups(previousGroups);
      alert("Couldn't decline this request: " + error.message);
    });
  };

  return (
    <Layout>
      <SmallAppBar title="Message requests" onBack={() => navigation.goBack()} />

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
                onDelete={() => handleDeclineRequest(item.groupID)}
                deleteLabel="Decline message request"
                trailingButton={{
                  label: "View",
                  onPress: () => navigation.navigate("ChatRoom", { group: item }),
                }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="mail-outline" size={56} color={tokens.textLight} />
                <Header3Text color={tokens.textLight} center>
                  {"You don't have any\nmessage requests"}
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
