// Invite friends to an event — reused for two flows that both end in the
// same "send invites" action: 1) finishing creating a brand-new event
// (Organize.js's last step, invite.from is unset) which creates the event
// once invites go out, and 2) inviting more people into an event that
// already exists (WhileYouEat.js and the event view's "..." menu both pass
// invite.from === "WhileYouEat"), which only sends invite docs.
//
// UI mirrors NewChat.js: connections load first, the full user base is only
// fetched lazily once someone searches, and picks show as animated chips
// above the search bar.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, FlatList, ScrollView, Animated, LayoutAnimation } from "react-native";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { Ionicons } from "@expo/vector-icons";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import SelectedUserChip, { EXIT_DURATION } from "../../components/SelectedUserChip";
import Header3Text from "../../components/typography/Header3Text";

import { db, auth, storage } from "../../provider/Firebase";
import firebase from "firebase/compat";
import { createNewChat } from "../Chat/Chats";
import { tryoutId } from "../../utils/constants";

const CHIP_ROW_HEIGHT = 94;

const storeImage = (uri, eventId) =>
  fetch(uri)
    .then((response) => response.blob())
    .then((blob) => storage.ref().child("eventPictures/" + eventId).put(blob));

const fetchImage = (eventId) => storage.ref().child("eventPictures/" + eventId).getDownloadURL();

// One invite doc for one person — same shape/destination as the original
// screen's write, whichever flow triggered it.
async function sendInvitation(person, invite, host) {
  // Firestore rejects `undefined` field values outright, and some older
  // event/user docs are missing optional fields (e.g. no stored `type`,
  // no additionalInfo) — default each one so a legacy doc can't crash this
  // write.
  await db.collection("User Invites").doc(person.id).collection("Invites").add({
    type: invite.type ?? null,
    startDate: invite.startDate ?? null,
    endDate: invite.endDate ?? null,
    description: invite.additionalInfo ?? "",
    hostID: host.id ?? null,
    hostFirstName: host.firstName ?? "",
    hostLastName: host.lastName ?? "",
    hasImage: invite.hasImage ?? false,
    image: invite.image ?? "",
    hasHostImage: host.hasImage ?? false,
    hostImage: host.image ?? "",
    location: invite.location ?? "",
    name: invite.name ?? "",
    inviteID: invite.id ?? null,
  });
}

// Creates the event, invites the selected people, and starts the event's
// group chat — the "finishing event creation" path.
async function createEventAndInvite(selected, invite, navigation, host, id, image) {
  const table = invite.type === "public" ? "Public Events" : "Private Events";
  const chatID = String(invite.startDate) + invite.name;

  await db.collection(table).doc(id).set({
    id,
    name: invite.name ?? "",
    hostID: host.id ?? null,
    hostFirstName: host.firstName ?? "",
    hostLastName: host.lastName ?? "",
    hasHostImage: host.hasImage ?? false,
    hostImage: host.image ?? "",
    location: invite.location ?? "",
    startDate: invite.startDate ?? null,
    endDate: invite.endDate ?? null,
    additionalInfo: invite.additionalInfo ?? "",
    ice: invite.icebreakers ?? [],
    attendees: [host.id], // Only the host starts out attending
    hasImage: invite.hasImage ?? false,
    image: image ?? "",
    chatID,
    type: invite.type ?? "private",
  });

  await Promise.all(selected.map((person) => sendInvitation(person, invite, host)));

  const storeID = { type: invite.type, id };
  await db.collection("Users").doc(host.id).update({
    hostedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
    attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
    attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
  });

  const uids = [...selected.map((person) => person.id), host.id];
  createNewChat(uids, chatID, invite.name, false);

  navigation.goBack();
  invite.clearAll?.();
  alert("Invitations sent! Make sure to do attendance when the meal starts!");
}

export default function InvitePeople({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const invite = route.params;
  const isExistingEvent = invite.from === "WhileYouEat";
  const alreadyAttending = invite.attendees || [];

  const [connections, setConnections] = useState([]);
  const [allUsers, setAllUsers] = useState(null);
  const [blockedIDs, setBlockedIDs] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [exitingIds, setExitingIds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
    lastName: data.lastName,
    name: data.firstName + " " + data.lastName,
    image: data.hasImage ? data.image : null,
    hasImage: data.hasImage,
    blockedIDs: data.blockedIDs || [],
  });

  // Connections (from friendIDs), same lazy-full-search pattern as NewChat —
  // fetching every user up front just to show a handful of connections is
  // what made that screen slow to open, same fix applies here.
  useEffect(() => {
    const unsubscribeUser = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const ids = (doc.data().friendIDs || []).filter((id) => !alreadyAttending.includes(id));
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
          db.collection("Users").where(firebase.firestore.FieldPath.documentId(), "in", chunk).get()
        )
      ).then((snapshots) => {
        const people = [];
        snapshots.forEach((snapshot) => snapshot.forEach((doc) => people.push(toPerson(doc.data()))));
        setConnections(people);
        setLoading(false);
      });
    });

    return () => unsubscribeUser();
  }, []);

  const query = search.trim().toLowerCase();

  useEffect(() => {
    if (query === "" || allUsers !== null) return;

    db.collection("Users").get().then((snapshot) => {
      const people = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id === user.uid || data.id === tryoutId) return;
        if (alreadyAttending.includes(data.id)) return;
        people.push(toPerson(data));
      });
      setAllUsers(people);
    });
  }, [query, allUsers]);

  const displayList = useMemo(() => {
    if (query === "") {
      return [...connections].sort((a, b) => a.name.localeCompare(b.name));
    }

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

  const handleSend = async () => {
    if (selectedUsers.length === 0 || sending) return;
    setSending(true);

    try {
      const hostDoc = await db.collection("Users").doc(user.uid).get();
      const host = hostDoc.data();

      if (isExistingEvent) {
        await Promise.all(selectedUsers.map((person) => sendInvitation(person, invite, host)));
        navigation.goBack();
        alert("Invitations sent! Make sure to do attendance when the meal starts!");
        return;
      }

      const id = Date.now() + user.uid;
      const image = invite.hasImage ? await storeImage(invite.image, id).then(() => fetchImage(id)) : "";
      await createEventAndInvite(selectedUsers, invite, navigation, host, id, image);
    } catch (error) {
      console.error("Failed to send invites:", error);
      alert("Couldn't send invites: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <SmallAppBar
        title="Invite friends"
        onBack={() => navigation.goBack()}
        actions={selectedUsers.length > 0 ? [{ icon: "paper-plane-outline", onPress: handleSend }] : []}
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
                  {query === "" ? "No connections to invite yet" : "No results found"}
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
