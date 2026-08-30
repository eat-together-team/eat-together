//Discovery feed: a preview of upcoming events and suggested people, each with a "View all" to the full list.

import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Animated } from "react-native";
import { Layout } from "../../rapi_ui_components";

import LargeAppBar from "../../components/LargeAppBar";
import ExploreSectionHeader from "../../components/ExploreSectionHeader";
import ExploreSectionHeaderSkeleton from "../../components/ExploreSectionHeaderSkeleton";
import EventPreviewCard from "../../components/EventPreviewCard";
import EventPreviewCardSkeleton from "../../components/EventPreviewCardSkeleton";
import SuggestedPersonRow from "../../components/SuggestedPersonRow";
import SuggestedPersonRowSkeleton from "../../components/SuggestedPersonRowSkeleton";
import PromoImageCard from "../../components/PromoImageCard";
import PromoImageCardSkeleton from "../../components/PromoImageCardSkeleton";

import useDeferredReady from "../../utils/useDeferredReady";
import { compareDates } from "../../utils/methods";
import { tryoutId } from "../../utils/constants";
import { auth, db } from "../../provider/Firebase";
import { useTutorial, useTutorialTarget } from "../../provider/TutorialProvider";

const restaurantPickerImage = require("../../../assets/restaurantPicker.png");
const diningDollarExchangeImage = require("../../../assets/diningDollarExchange.png");

const PREVIEW_COUNT = 3;

export default function ({ navigation }) {
  const user = auth.currentUser;

  const [hasNotif, setHasNotif] = useState(false);
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const loading = eventsLoading || peopleLoading;

  const ready = useDeferredReady();
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const { startTutorial } = useTutorial();
  const notificationsTargetRef = useTutorialTarget("notifications");

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

  // Looks for changes to notifications in real-time
  useEffect(() => {
    if (!ready) return;

    const unsubscribe = db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        setHasNotif(doc.data().hasNotif);
      }
    });

    return () => unsubscribe();
  }, [ready]);

  // Previews of upcoming events and suggested people (filtered the same way
  // as AllEvents.js and People.js's full lists, just capped to a few rows).
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    let unsubscribeEvents = () => {};
    let unsubscribePeople = () => {};

    db.collection("Users").doc(user.uid).get().then((doc) => {
      if (cancelled) return;
      const userData = doc.data() || {};
      const blockedIDs = userData.blockedIDs || [];
      const friendIDs = userData.friendIDs || [];

      // Show the guided tour the first time a user lands here — either
      // right after account creation or on their first login since this
      // feature shipped — and never again automatically after that
      // (settings.hasSeenTutorial flips true once they finish or skip it;
      // "Launch tutorial" in Settings re-triggers it directly rather than
      // through this flag). Folded into this existing user-doc read rather
      // than a dedicated one, since this effect already fetches it.
      if (!userData.settings?.hasSeenTutorial) {
        startTutorial();
      }

      unsubscribeEvents = db.collection("Public Events").onSnapshot((query) => {
        let upcoming = [];
        query.forEach((eventDoc) => {
          const data = eventDoc.data();
          if (data.visibleTo != null && !data.visibleTo.includes(user.uid) && data.hostID !== user.uid) return;
          if (blockedIDs.includes(data.hostID)) return;

          const eventDate = data.startDate ? data.startDate.toDate() : data.date.toDate();
          if (eventDate > new Date()) upcoming.push(data);
        });

        upcoming.sort(compareDates);
        setEvents(upcoming.slice(0, PREVIEW_COUNT));
        setEventsLoading(false);
      });

      unsubscribePeople = db.collection("Users").onSnapshot((query) => {
        let suggestions = [];
        query.forEach((personDoc) => {
          const data = personDoc.data();
          if (
            data.id !== user.uid &&
            data.id !== tryoutId &&
            data.verified &&
            !data.settings?.privateAccount &&
            !blockedIDs.includes(data.id) &&
            !(data.blockedIDs || []).includes(user.uid) &&
            !friendIDs.includes(data.id)
          ) {
            suggestions.push(data);
          }
        });

        setPeople(suggestions.slice(0, PREVIEW_COUNT));
        setPeopleLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribeEvents();
      unsubscribePeople();
    };
  }, [ready]);

  return (
    <Layout>
      <LargeAppBar
        title="Explore"
        actions={[
          {
            icon: hasNotif ? "notifications" : "notifications-outline",
            targetRef: notificationsTargetRef,
            onPress: () => {
              if (user.uid === tryoutId) {
                alert("Please log in to view notifications!");
              } else {
                navigation.navigate("Notifications", { fromNav: false });
              }
            },
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.skeletonSections}>
            <View style={styles.eventsSection}>
              <ExploreSectionHeaderSkeleton />
              <View style={styles.eventsRow}>
                <EventPreviewCardSkeleton />
                <EventPreviewCardSkeleton />
                <EventPreviewCardSkeleton />
              </View>
            </View>

            <PromoImageCardSkeleton />

            <View style={styles.section}>
              <ExploreSectionHeaderSkeleton />
              <View style={styles.peopleList}>
                <SuggestedPersonRowSkeleton />
                <SuggestedPersonRowSkeleton />
                <SuggestedPersonRowSkeleton />
              </View>
            </View>

            <PromoImageCardSkeleton />
          </View>
        ) : (
          <Animated.View style={[styles.sections, { opacity: contentOpacity }]}>
            {events.length > 0 && (
              <View style={styles.eventsSection}>
                <ExploreSectionHeader title="Events" onViewAll={() => navigation.navigate("AllEvents")} />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.eventsRow}
                >
                  {events.map((event) => (
                    <EventPreviewCard
                      key={event.id}
                      event={event}
                      onPress={() => navigation.navigate("FullCard", { event })}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <PromoImageCard
              image={restaurantPickerImage}
              title="Restaurant Picker"
              subtitle="Tell us what you like and we’ll match you with the right restaurants"
              buttonLabel="Get recommended"
              onPress={() => navigation.navigate("Restaurant")}
            />

            {people.length > 0 && (
              <View style={styles.section}>
                <ExploreSectionHeader title="People" onViewAll={() => navigation.navigate("People")} />
                <View style={styles.peopleList}>
                  {people.map((person) => (
                    <SuggestedPersonRow
                      key={person.id}
                      person={person}
                      onPress={() => navigation.navigate("FullProfile", { person })}
                    />
                  ))}
                </View>
              </View>
            )}

            <PromoImageCard
              image={diningDollarExchangeImage}
              title="Dining Dollar Exchange"
              subtitle="Request and offer up your extra campus dining dollars for cash or payment"
              buttonLabel="Check it out"
              onPress={() => alert("Coming soon!")}
            />
          </Animated.View>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sections: {
    gap: 22,
  },
  skeletonSections: {
    gap: 22,
  },
  section: {
    gap: 9,
  },
  eventsSection: {
    gap: 14,
  },
  eventsRow: {
    flexDirection: "row",
    gap: 12,
  },
  peopleList: {
    gap: 16,
  },
});
