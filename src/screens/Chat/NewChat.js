// Start a new chat — pick one connection for a 1-on-1, or several for a
// group chat. Connections show an add button; searching also surfaces
// non-connections (with a disabled-for-now "Request" pill instead), since
// the search covers the whole user base, not just your connections.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Animated,
  LayoutAnimation,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import SelectedUserChip, { EXIT_DURATION } from "../../components/SelectedUserChip";
import OutlinePillButton from "../../components/OutlinePillButton";
import Header3Text from "../../components/typography/Header3Text";
import { Ionicons } from "@expo/vector-icons";
import { createNewChat, createMessageRequest } from "./Chats";
import useDeferredReady from "../../utils/useDeferredReady";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

// Matches SelectedUserChip's intrinsic content height (56 avatar + 6 gap +
// ~14 label + 18 row padding) so the wrapper can animate to/from it.
const CHIP_ROW_HEIGHT = 94;

// Figma export (people.svg) — stroke color is passed in rather than baked
// in as the exported #BBBBBB so it can adapt to light/dark theme, same
// treatment as the empty-state icons in Chats.js/ArchivedChats.js.
const EmptyConnectionsIcon = ({ size = 59, color }) => (
  <Svg width={size} height={size} viewBox="0 0 59 59" fill="none">
    <Path
      d="M46.3292 19.3615C45.9915 24.0488 42.5144 27.6596 38.7226 27.6596C34.9309 27.6596 31.448 24.0499 31.1161 19.3615C30.7703 14.4853 34.1553 11.0635 38.7226 11.0635C43.29 11.0635 46.675 14.574 46.3292 19.3615Z"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M38.7202 35.0337C31.2104 35.0337 23.9887 38.7638 22.1795 46.0282C21.9398 46.9893 22.5425 47.9399 23.53 47.9399H53.9116C54.8991 47.9399 55.4984 46.9893 55.2621 46.0282C53.453 38.6474 46.2312 35.0337 38.7202 35.0337Z"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
    />
    <Path
      d="M23.0524 21.4314C22.7826 25.1757 19.9721 28.1246 16.9425 28.1246C13.9129 28.1246 11.0977 25.1768 10.8326 21.4314C10.5571 17.536 13.2927 14.752 16.9425 14.752C20.5923 14.752 23.3279 17.6075 23.0524 21.4314Z"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M23.7408 35.2625C21.6605 34.3094 19.3693 33.9429 16.941 33.9429C10.948 33.9429 5.1739 36.9221 3.7275 42.725C3.53734 43.4926 4.01909 44.2521 4.8074 44.2521H17.7478"
      stroke={color}
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </Svg>
);

export default function NewChat({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = firebase.auth().currentUser;
  const ready = useDeferredReady();

  // Connections (from friendIDs) load fast and are all this screen needs by
  // default. The full user base is only fetched lazily the first time
  // someone actually searches — fetching every user up front just to show a
  // handful of connections was what made this screen slow to open.
  const [connections, setConnections] = useState([]);
  const [allUsers, setAllUsers] = useState(null);
  const [friendIDs, setFriendIDs] = useState([]);
  const [blockedIDs, setBlockedIDs] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [exitingIds, setExitingIds] = useState([]);
  const [requestingIds, setRequestingIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const chipRowHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chipRowHeight, {
      toValue: selectedUsers.length > 0 ? CHIP_ROW_HEIGHT : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [selectedUsers.length]);

  const toPerson = (data) => ({
    id: data.id,
    username: data.username,
    firstName: data.firstName,
    name: data.firstName + " " + data.lastName,
    image: data.hasImage ? data.image : null,
    blockedIDs: data.blockedIDs || [],
  });

  useEffect(() => {
    if (!ready) return;

    const unsubscribeUser = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const ids = doc.data().friendIDs || [];
      setFriendIDs(ids);
      setBlockedIDs(doc.data().blockedIDs || []);

      if (ids.length === 0) {
        setConnections([]);
        setLoading(false);
        return;
      }

      // Firestore 'in' queries cap at 10 values, so chunk larger friend lists.
      const chunks = [];
      for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

      Promise.all(
        chunks.map((chunk) =>
          db
            .collection("Users")
            .where(firebase.firestore.FieldPath.documentId(), "in", chunk)
            .get()
        )
      ).then((snapshots) => {
        const people = [];
        snapshots.forEach((snapshot) =>
          snapshot.forEach((doc) => people.push(toPerson(doc.data())))
        );
        setConnections(people);
        setLoading(false);
      });
    });

    return () => unsubscribeUser();
  }, [ready]);

  const isConnection = (personID) => friendIDs.includes(personID);

  const query = search.trim().toLowerCase();

  // The whole user base is only needed once someone actually searches —
  // fetched once, lazily, and cached from then on.
  useEffect(() => {
    if (query === "" || allUsers !== null) return;

    db.collection("Users")
      .get()
      .then((snapshot) => {
        const people = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.id === user.uid) return;
          people.push(toPerson(data));
        });
        setAllUsers(people);
      });
  }, [query, allUsers]);

  const displayList = useMemo(() => {
    if (query === "") {
      return [...connections].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Fall back to just connections while the full user base is still
    // loading, so search isn't empty in the meantime.
    const source = allUsers ?? connections;
    const visible = source.filter(
      (person) => !blockedIDs.includes(person.id) && !person.blockedIDs.includes(user.uid)
    );

    return visible
      .filter(
        (person) =>
          person.name.toLowerCase().includes(query) || person.username.toLowerCase().includes(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [connections, allUsers, blockedIDs, query]);

  const handleSearchChange = (text) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch(text);
  };

  // Adding just appends (the chip animates itself in on mount). Removing is
  // staged: the chip is marked "exiting" so it can animate out in place,
  // then it's actually dropped from selectedUsers once that finishes —
  // otherwise it'd vanish from the list immediately with no chance to
  // animate.
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

  // Chat IDs are deterministic (sorted usernames), so an existing chat with
  // this exact set of people already lives under a predictable doc — reopen
  // it instead of creating a duplicate. Works the same whether it's a 1-on-1
  // or a group.
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    const userDoc = await db.collection("Users").doc(user.uid).get();
    const userData = userDoc.data();
    const currentUserName = userData.firstName + " " + userData.lastName;

    const usernames = [...selectedUsers.map((p) => p.username), userData.username].sort();
    const chatID = usernames.join();
    const uids = [...selectedUsers.map((p) => p.id), user.uid];

    const existing = await db.collection("Groups").doc(chatID).get();
    if (existing.exists) {
      const data = existing.data();
      let name = data.name.replace(currentUserName + ", ", "");
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

    // A group (3+ people) starts out named "New group" — renaming happens
    // later from GroupSettings.js. A 1-on-1 keeps the existing joined-names
    // convention (there's no separate naming step for those).
    const isGroup = selectedUsers.length > 1;
    const chatName = isGroup
      ? "New group"
      : [...selectedUsers.map((p) => p.name), currentUserName].join(", ");
    createNewChat(uids, chatID, chatName, true);

    navigation.navigate("ChatRoom", {
      group: {
        groupID: chatID,
        uids,
        name: isGroup ? "New group" : selectedUsers.map((p) => p.name).join(", "),
        messages: [],
      },
    });
  };

  // Messaging a non-connection is a request, not a normal chat — same
  // deterministic-chatID reopen logic as handleCreateChat, but a brand new
  // one is created pending (see createMessageRequest in Chats.js) rather
  // than immediately joined. Always 1-on-1: non-connections can't be added
  // to the multi-select group-forming flow above.
  const handleRequest = async (person) => {
    if (requestingIds.includes(person.id)) return;
    setRequestingIds((prev) => [...prev, person.id]);

    try {
      const userDoc = await db.collection("Users").doc(user.uid).get();
      const userData = userDoc.data();
      const currentUserName = userData.firstName + " " + userData.lastName;
      const chatID = [userData.username, person.username].sort().join();

      const existing = await db.collection("Groups").doc(chatID).get();
      if (existing.exists) {
        const data = existing.data();
        let name = data.name.replace(currentUserName + ", ", "");
        if (name.endsWith(", " + currentUserName)) {
          name = name.slice(0, -1 * (currentUserName.length + 2));
        }

        await db.collection("Users").doc(user.uid).update({
          groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
          archivedGroupIDs: firebase.firestore.FieldValue.arrayRemove(chatID),
        });

        navigation.navigate("ChatRoom", {
          group: {
            groupID: chatID,
            uids: data.uids,
            name,
            messages: data.messages || [],
            pending: data.pending || false,
            requestedBy: data.requestedBy || null,
          },
        });
        return;
      }

      await createMessageRequest(user, userData, person, chatID);
      navigation.navigate("ChatRoom", {
        group: {
          groupID: chatID,
          uids: [person.id, user.uid],
          name: person.name,
          messages: [],
          pending: true,
          requestedBy: user.uid,
        },
      });
    } catch (error) {
      console.error("Failed to send message request:", error);
      alert("Couldn't send request: " + error.message);
    } finally {
      setRequestingIds((prev) => prev.filter((id) => id !== person.id));
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title="New chat"
        onBack={() => navigation.goBack()}
        actions={selectedUsers.length > 0 ? [{ icon: "checkmark", onPress: handleCreateChat }] : []}
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

        {loading || (query !== "" && allUsers === null) ? (
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
              const connection = isConnection(item.id);
              const selected =
                selectedUsers.some((p) => p.id === item.id) && !exitingIds.includes(item.id);

              return (
                <UserListItem
                  person={item}
                  onPress={connection ? toggleSelect : undefined}
                  renderRight={
                    connection ? (
                      <Ionicons
                        name={selected ? "checkmark-circle" : "add-circle-outline"}
                        size={26}
                        color={selected ? tokens.primary : tokens.onContainerHigh}
                      />
                    ) : (
                      <OutlinePillButton
                        label="Request"
                        onPress={() => handleRequest(item)}
                        disabled={requestingIds.includes(item.id)}
                        color={tokens.primary}
                      />
                    )
                  }
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <EmptyConnectionsIcon color={tokens.textLight} />
                <Header3Text color={tokens.textLight} center>
                  {query === "" ? "You don't have any\nconnections yet!" : "No results found"}
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
