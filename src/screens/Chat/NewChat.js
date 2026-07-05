// Start a new 1-on-1 chat by picking a connection. Group chats are handled
// separately (GroupChat.js) — this flow is single-person only for now.

import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Layout } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import EmptyState from "../../components/EmptyState";
import { createNewChat } from "./Chats";
import useDeferredReady from "../../utils/useDeferredReady";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

export default function NewChat({ navigation }) {
  const user = firebase.auth().currentUser;
  const ready = useDeferredReady();
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    const unsubscribe = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const friendIDs = doc.data().friendIDs || [];

      if (friendIDs.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }

      let temp = [];
      let remaining = friendIDs.length;
      friendIDs.forEach((uid) => {
        db.collection("Users")
          .doc(uid)
          .get()
          .then((friendDoc) => {
            const data = friendDoc.data();
            if (data) {
              temp.push({
                id: uid,
                username: data.username,
                name: data.firstName + " " + data.lastName,
                image: data.hasImage ? data.image : null,
              });
            }
          })
          .finally(() => {
            remaining--;
            if (remaining === 0) {
              temp.sort((a, b) => a.name.localeCompare(b.name));
              setConnections(temp);
              setLoading(false);
            }
          });
      });
    });

    return () => unsubscribe();
  }, [ready]);

  const filteredConnections = connections.filter((person) =>
    person.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Chat IDs are deterministic (sorted usernames) so a 1-on-1 chat with this
  // person already exists under a predictable doc — reopen it instead of
  // creating a duplicate.
  const openOrCreateChat = async (person) => {
    const userDoc = await db.collection("Users").doc(user.uid).get();
    const userData = userDoc.data();
    const currentUserName = userData.firstName + " " + userData.lastName;
    const chatID = [userData.username, person.username].sort().join();

    const existing = await db.collection("Groups").doc(chatID).get();
    if (existing.exists) {
      const data = existing.data();
      let name = data.name;
      name = name.replace(currentUserName + ", ", "");
      if (name.endsWith(", " + currentUserName)) {
        name = name.slice(0, -1 * (currentUserName.length + 2));
      }

      // Re-link it into the current user's own inbox in case it was
      // previously deleted/archived on their side — otherwise reopening it
      // here wouldn't make it show back up in their chat list.
      await db.collection("Users").doc(user.uid).update({
        groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
        archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(chatID),
      });

      navigation.navigate("ChatRoom", {
        group: { groupID: chatID, uids: data.uids, name, messages: data.messages || [] },
      });
      return;
    }

    const chatName = [person.name, currentUserName].join(", ");
    createNewChat([person.id, user.uid], chatID, chatName, true);

    navigation.navigate("ChatRoom", {
      group: { groupID: chatID, uids: [person.id, user.uid], name: person.name, messages: [] },
    });
  };

  return (
    <Layout>
      <SmallAppBar title="New chat" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Searchbar value={search} onChangeText={setSearch} placeholder="Search" />

        {loading ? (
          <View style={styles.list}>
            {Array.from({ length: 7 }).map((_, index) => (
              <UserListItemSkeleton key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            data={filteredConnections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserListItem person={item} onPress={openOrCreateChat} />}
            ListEmptyComponent={
              <EmptyState
                title="No connections found"
                text="Add some connections to start chatting!"
              />
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
  },
  list: {
    paddingHorizontal: 20,
  },
});
