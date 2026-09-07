// "My events" — every event a given user has ever hosted (their
// hostedEventIDs), reached via the fast-food icon on your own profile's top
// bar (Me.js only shows it there — FullProfile.js hides the icon on
// everyone else's profile). Still takes `route.params.userId` rather than
// assuming the current user, so nothing here breaks if that ever changes.
// Reuses EventListingCard/EventListingCardSkeleton wholesale; their existing
// layout (cover photo, title, date/time/location, attendee avatars + host
// name) already matches this screen's design exactly.

import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Layout } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import EventListingCard from "../../components/EventListingCard";
import EventListingCardSkeleton from "../../components/EventListingCardSkeleton";
import EmptyState from "../../components/EmptyState";

import { db, auth } from "../../provider/Firebase";
import { compareDates } from "../../utils/methods";

const SKELETON_COUNT = 3;

export default function MyEvents({ route, navigation }) {
  const { userId } = route.params;
  // Only offer "+ new event" when viewing your own hosted events, not
  // someone else's (this screen is shared by both — see header comment).
  const isOwnEvents = userId === auth.currentUser?.uid;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    db.collection("Users")
      .doc(userId)
      .get()
      .then(async (doc) => {
        const hostedEventIDs = doc.data()?.hostedEventIDs || [];

        const fetched = await Promise.all(
          hostedEventIDs.map(({ id, type }) => {
            const table = type === "private" ? "Private Events" : "Public Events";
            return db
              .collection(table)
              .doc(id)
              .get()
              .then((eventDoc) => (eventDoc.exists ? { ...eventDoc.data(), type } : null))
              .catch(() => null);
          })
        );

        if (cancelled) return;
        setEvents(fetched.filter(Boolean).sort((a, b) => -compareDates(a, b)));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <Layout>
      <SmallAppBar
        title="My events"
        onBack={() => navigation.goBack()}
        actions={isOwnEvents ? [{ icon: "add", onPress: () => navigation.navigate("OrganizeFlow") }] : []}
      />

      {loading ? (
        <View style={styles.list}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <EventListingCardSkeleton key={index} />
          ))}
        </View>
      ) : events.length === 0 ? (
        <EmptyState title="No events yet" text="Events you host will show up here." />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(event) => event.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <EventListingCard event={item} onPress={() => navigation.navigate("FullCard", { event: item })} />
          )}
        />
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 25,
  },
});
