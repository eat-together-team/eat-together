// Notifications page — categorised list of everything waiting on the user.
// Categories with nothing in them are hidden entirely, header included.

import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import SmallAppBar from "../../components/SmallAppBar";
import Header3Text from "../../components/typography/Header3Text";
import NotificationRow from "../../components/NotificationRow";
import NotificationSectionSkeleton from "../../components/NotificationSectionSkeleton";

import useNotificationFeed from "./useNotificationFeed";
import useDeferredReady from "../../utils/useDeferredReady";
import { auth, db } from "../../provider/Firebase";

const SKELETON_SECTIONS = 4;

export default function Notifications({ navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = auth.currentUser;
  const ready = useDeferredReady();

  const { sections, loading, accept, dismiss } = useNotificationFeed(user, {
    enabled: ready,
  });

  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) return;
    contentOpacity.setValue(0);
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [loading]);

  // Tapping a row goes wherever that kind of notification lives. The feed
  // describes the destination rather than navigating itself, so it stays
  // free of navigation concerns.
  const openTarget = (target) => {
    if (!target) return;

    switch (target.screen) {
      case "FullProfile":
        db.collection("Users")
          .doc(target.lookupPerson)
          .get()
          .then((doc) => {
            if (doc.exists) navigation.navigate("FullProfile", { person: doc.data() });
            else alert("This user seems to no longer exist :(");
          })
          .catch(() => alert("This user seems to no longer exist :("));
        break;

      case "NotificationFull": {
        const invite = target.invite;
        const end = invite.endDate || invite.startDate || invite.date;
        navigation.navigate("NotificationFull", {
          invite,
          hasPassed: end ? end.toDate().getTime() < Date.now() : false,
        });
        break;
      }

      case "FullCard":
        db.collection(target.eventType === "public event" ? "Public Events" : "Private Events")
          .doc(target.eventId)
          .get()
          .then((doc) => {
            if (doc.exists) navigation.navigate("FullCard", { event: doc.data() });
            else alert("This event no longer exists.");
          })
          .catch(() => alert("Error fetching this event. Try again later."));
        break;

      case "Recommendation":
        db.collection("Private Events")
          .doc(target.eventId)
          .get()
          .then((doc) => {
            if (doc.exists) navigation.navigate("Recommendation", { event: doc.data() });
            else alert("This recommendation is no longer available.");
          })
          .catch(() => alert("There seems to be an error fetching this recommendation."));
        break;

      case "ChatRoom":
        navigation.navigate("ChatRoom", { group: target.group });
        break;

      default:
        break;
    }
  };

  return (
    <Layout>
      <SmallAppBar title="Notifications" onBack={() => navigation.goBack()} />

      {loading ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sections}>
            {Array.from({ length: SKELETON_SECTIONS }).map((_, index) => (
              <NotificationSectionSkeleton key={index} />
            ))}
          </View>
        </ScrollView>
      ) : sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={56} color={tokens.textLight} />
          <Header3Text color={tokens.textLight} center>
            {"You're all caught up"}
          </Header3Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.sections, { opacity: contentOpacity }]}>
            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <Header3Text color={tokens.onBackground}>{section.title}</Header3Text>
                <View>
                  {section.data.map((item) => (
                    <NotificationRow
                      key={item.id}
                      name={item.name}
                      body={item.body}
                      timestamp={item.timestamp}
                      avatarUri={item.avatarUri}
                      thumbnail={item.thumbnail}
                      confirmation={item.confirmation}
                      action={
                        item.actionLabel
                          ? { label: item.actionLabel, onPress: () => accept(item) }
                          : null
                      }
                      dismissLabel={item.dismissLabel}
                      onDismiss={item.dismiss ? () => dismiss(item) : undefined}
                      onPress={() => openTarget(item.target)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      )}
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
    gap: 25,
  },
  section: {
    gap: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
