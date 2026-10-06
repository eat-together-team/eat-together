// Add connections to an existing group chat — same tap-to-select/chip-row
// pattern as NewChat.js's group-forming flow, simplified to connections
// only (no search-all-users/message-request paths, since this is adding to
// an already-existing chat, not starting a new one).

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, ScrollView, Animated, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import SelectedUserChip, { EXIT_DURATION } from "../../components/SelectedUserChip";
import Header3Text from "../../components/typography/Header3Text";
import { addSystemMessage } from "./Chats";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

const CHIP_ROW_HEIGHT = 94;

export default function AddGroupMembers({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = firebase.auth().currentUser;
  const { groupID, uids } = route.params;

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [exitingIds, setExitingIds] = useState([]);
  const [adding, setAdding] = useState(false);
  const chipRowHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chipRowHeight, {
      toValue: selectedUsers.length > 0 ? CHIP_ROW_HEIGHT : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selectedUsers.length]);

  useEffect(() => {
    db.collection("Users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        const friendIDs = (doc.data()?.friendIDs || []).filter((id) => !uids.includes(id));
        if (friendIDs.length === 0) {
          setConnections([]);
          setLoading(false);
          return;
        }

        // Firestore 'in' queries cap at 10 values, so chunk larger friend lists.
        const chunks = [];
        for (let i = 0; i < friendIDs.length; i += 10) chunks.push(friendIDs.slice(i, i + 10));

        Promise.all(
          chunks.map((chunk) =>
            db.collection("Users").where(firebase.firestore.FieldPath.documentId(), "in", chunk).get()
          )
        ).then((snapshots) => {
          const people = [];
          snapshots.forEach((snapshot) =>
            snapshot.forEach((doc) => {
              const data = doc.data();
              people.push({
                id: data.id,
                username: data.username,
                firstName: data.firstName,
                name: data.firstName + " " + data.lastName,
                image: data.hasImage ? data.image : null,
              });
            })
          );
          setConnections(people.sort((a, b) => a.name.localeCompare(b.name)));
          setLoading(false);
        });
      });
  }, []);

  const query = search.trim().toLowerCase();
  const displayList = useMemo(
    () =>
      connections.filter(
        (person) =>
          person.name.toLowerCase().includes(query) || person.username.toLowerCase().includes(query)
      ),
    [connections, query]
  );

  const handleSearchChange = (text) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch(text);
  };

  // Same add/remove animation pattern as NewChat.js — adding just appends
  // (the chip animates itself in), removing marks the chip "exiting" so it
  // can animate out before actually leaving selectedUsers.
  const toggleSelect = (person) => {
    const alreadySelected = selectedUsers.some((p) => p.id === person.id);
    if (!alreadySelected) {
      setSelectedUsers((prev) => [...prev, person]);
      return;
    }

    if (exitingIds.includes(person.id)) return;
    setExitingIds((prev) => [...prev, person.id]);
    setTimeout(() => {
      setSelectedUsers((prev) => prev.filter((p) => p.id !== person.id));
      setExitingIds((prev) => prev.filter((id) => id !== person.id));
    }, EXIT_DURATION);
  };

  const handleAdd = async () => {
    if (selectedUsers.length === 0 || adding) return;
    setAdding(true);

    try {
      await db
        .collection("Groups")
        .doc(groupID)
        .update({
          uids: firebase.firestore.FieldValue.arrayUnion(...selectedUsers.map((p) => p.id)),
        });

      await Promise.all(
        selectedUsers.map((person) =>
          db
            .collection("Users")
            .doc(person.id)
            .update({ groupIDs: firebase.firestore.FieldValue.arrayUnion(groupID) })
        )
      );

      // One message per person added, in the order they were selected.
      for (const person of selectedUsers) {
        await addSystemMessage(groupID, `${person.name} was added to the chat`);
      }

      navigation.goBack();
    } catch (error) {
      console.error("Failed to add members:", error);
      alert("Couldn't add people: " + (error.message || "Something went wrong."));
    } finally {
      setAdding(false);
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title="Add people"
        onBack={() => navigation.goBack()}
        actions={selectedUsers.length > 0 ? [{ icon: "checkmark", onPress: handleAdd }] : []}
      />

      <Animated.View style={[styles.chipRowWrap, { height: chipRowHeight }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {selectedUsers.map((person) => (
            <SelectedUserChip
              key={person.id}
              person={person}
              exiting={exitingIds.includes(person.id)}
              onRemove={toggleSelect}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <View style={styles.content}>
        <Searchbar value={search} onChangeText={handleSearchChange} placeholder="Search" />

        {loading ? (
          <View style={styles.list}>
            {Array.from({ length: 7 }).map((_, index) => (
              <UserListItemSkeleton key={index} />
            ))}
          </View>
        ) : (
          <FlatList
            contentContainerStyle={[styles.list, displayList.length === 0 && styles.listEmpty]}
            data={displayList}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected =
                selectedUsers.some((p) => p.id === item.id) && !exitingIds.includes(item.id);

              return (
                <UserListItem
                  person={item}
                  onPress={toggleSelect}
                  renderRight={
                    <Ionicons
                      name={selected ? "checkmark-circle" : "add-circle-outline"}
                      size={26}
                      color={selected ? tokens.primary : tokens.onContainerHigh}
                    />
                  }
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Header3Text color={tokens.textLight} center>
                  {query === ""
                    ? "All your connections are\nalready in this chat"
                    : "No results found"}
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
  },
  list: {
    paddingHorizontal: 20,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  chipRowWrap: {
    overflow: "hidden",
  },
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  chipRow: {
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
  },
});
