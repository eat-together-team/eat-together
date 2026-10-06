// Add a person to a photo's tagged list — reached from the "People in this
// photo" bottom sheet when the viewer uploaded the photo. Same connections-
// first-then-lazy-full-search UI as InvitePeople/NewChat, except tapping a
// person here commits immediately and navigates back (no multi-select, no
// confirm step, no chip row).

import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, LayoutAnimation } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import SmallAppBar from "../../components/SmallAppBar";
import Searchbar from "../../components/Searchbar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import Header3Text from "../../components/typography/Header3Text";

import { db, auth } from "../../provider/Firebase";
import * as firebase from "firebase/compat";

const dbNameForEvent = (event) => (event?.type === "private" ? "Private Events" : "Public Events");

const toPerson = (data) => ({
  id: data.id,
  username: data.username,
  firstName: data.firstName,
  lastName: data.lastName,
  name: data.firstName + " " + data.lastName,
  image: data.hasImage ? data.image : null,
  blockedIDs: data.blockedIDs || [],
});

export default function AddTaggedPerson({ route, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const { event, photo } = route.params;
  const alreadyTagged = photo.taggedUserIds || [];

  const [connections, setConnections] = useState([]);
  const [allUsers, setAllUsers] = useState(null);
  const [blockedIDs, setBlockedIDs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const unsubscribeUser = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (!doc.exists) return;
      const ids = (doc.data().friendIDs || []).filter((id) => !alreadyTagged.includes(id));
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
        if (data.id === user.uid) return;
        if (alreadyTagged.includes(data.id)) return;
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

  const handleAddPerson = async (person) => {
    if (savingId) return;
    setSavingId(person.id);
    try {
      // Re-read the gallery fresh and replace this photo's entry in place —
      // safer than the arrayRemove(photo)+arrayUnion(...) dance the delete
      // flows use, since it doesn't depend on `photo` still deep-equaling
      // whatever's actually in Firestore right now.
      const eventRef = db.collection(dbNameForEvent(event)).doc(event.id);
      const doc = await eventRef.get();
      const gallery = (doc.data() && doc.data().eventGallery) || [];
      const updatedGallery = gallery.map((p) =>
        p.imageId === photo.imageId
          ? { ...p, taggedUserIds: [...(p.taggedUserIds || []), person.id] }
          : p
      );
      await eventRef.update({ eventGallery: updatedGallery });
      navigation.goBack();
    } catch (error) {
      console.error("Error tagging person: ", error);
      setSavingId(null);
    }
  };

  return (
    <Layout>
      <SmallAppBar title="Add person" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Searchbar value={search} onChangeText={handleSearchChange} placeholder="Search people" />

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
            renderItem={({ item }) => (
              <UserListItem
                person={item}
                onPress={handleAddPerson}
                renderRight={
                  <Ionicons
                    name={savingId === item.id ? "hourglass-outline" : "add-circle-outline"}
                    size={26}
                    color={tokens.onContainerHigh}
                  />
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Header3Text color={tokens.textLight} center>
                  {query === "" ? "No connections to add yet" : "No results found"}
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
});
