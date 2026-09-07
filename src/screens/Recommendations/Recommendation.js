// Recommendation preview — an AI-curated meetup suggestion. Unlike a real
// event, there's nothing to attend/withdraw from here: the two actions are
// "Create event" (hands the suggested details to the new-event wizard as a
// starting point — see OrganizeFlow.js's `prefill` param — so the user can
// adjust them, post a real event and invite friends) or "Dismiss
// recommendation" (removes it from the user's notifications for good).

import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import openMap from "react-native-open-maps";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import { db, auth } from "../../provider/Firebase";

import SmallAppBar from "../../components/SmallAppBar";
import InformationCard from "../../components/InformationCard";
import LargeButton from "../../components/LargeButton";
import Header3Text from "../../components/typography/Header3Text";
import Header4Text from "../../components/typography/Header4Text";
import SubBodyText from "../../components/typography/SubBodyText";
import StaticMapImage from "../../components/StaticMapImage";
import RecommendationInfoDialog from "../../components/Recommendations/RecommendationInfoDialog";

import getDate from "../../utils/getDate";
import getTime from "../../utils/getTime";
import parseLocation from "../../utils/parseLocation";

const AttendeeRow = ({ person, textColor, bgColor }) => (
  <View style={[styles.attendeeRow, { backgroundColor: bgColor }]}>
    <Image
      source={person.hasImage ? { uri: person.image } : require("../../../assets/logo.png")}
      style={styles.attendeeAvatar}
    />
    <SubBodyText color={textColor}>{`${person.firstName} ${person.lastName}`}</SubBodyText>
  </View>
);

const Recommendation = ({ route, navigation }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const event = route.params.event;

  const [attendees, setAttendees] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Load whoever this meetup is suggested with, to show under "With".
  useEffect(() => {
    (event.suggestedAttendees || []).forEach((uid) => {
      if (uid === user.uid) return;
      db.collection("Users").doc(uid).get().then((doc) => {
        if (doc.exists) setAttendees((prev) => [...prev, { id: doc.id, ...doc.data() }]);
      });
    });
  }, []);

  // Auto-show the "what's this?" explainer the first time this user ever
  // opens a recommendation.
  useEffect(() => {
    db.collection("Users").doc(user.uid).get().then((doc) => {
      if (!doc.data()?.settings?.hasSeenRecommendationInfo) setInfoVisible(true);
    });
  }, []);

  const markInfoSeen = () => {
    db.collection("Users").doc(user.uid).update({ "settings.hasSeenRecommendationInfo": true }).catch(() => {});
  };

  const closeInfo = () => {
    setInfoVisible(false);
    markInfoSeen();
  };

  const goToRecommendationSettings = () => {
    setInfoVisible(false);
    markInfoSeen();
    navigation.navigate("Profile", { screen: "Recommendations" });
  };

  // Hands the suggestion to the new-event wizard as a starting point, not an
  // existing event to edit — see OrganizeFlow.js's `prefill` vs `event`
  // params. Nothing is created (or removed from notifications) unless the
  // user actually finishes that flow.
  const createEvent = () => {
    navigation.navigate("OrganizeFlow", { prefill: event });
  };

  const dismissRecommendation = async () => {
    if (dismissing) return;
    setDismissing(true);
    try {
      const userDoc = await db.collection("Users").doc(user.uid).get();
      const notifications = (userDoc.data()?.notifications || []).filter(
        (notif) => !(notif.type === "recommendation" && notif.id === event.id)
      );
      await db.collection("Users").doc(user.uid).update({ notifications });
      navigation.goBack();
    } catch (err) {
      Alert.alert("Something went wrong", "Please try again.");
      setDismissing(false);
    }
  };

  const eventDate = event.startDate ? event.startDate.toDate() : event.date.toDate();
  const eventEndDate = event.endDate ? event.endDate.toDate() : null;
  const location = parseLocation(event.location) || { name: event.location, address: "" };

  return (
    <Layout style={styles.screen}>
      <SmallAppBar
        onBack={() => navigation.goBack()}
        actions={[
          {
            icon: "ellipsis-vertical",
            onPress: () => Alert.alert("Coming soon", "Reporting a recommendation will be available soon."),
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <InformationCard
          type="Action"
          text={'This is an event recommendation. Click "create event" to adjust details, create the event and invite your friends!'}
          actionText="What's this?"
          onAction={() => setInfoVisible(true)}
        />

        <View style={[styles.card, { borderColor: tokens.outline, backgroundColor: tokens.background }]}>
          <Header3Text color={tokens.textMedium}>{event.name}</Header3Text>

          <View style={styles.section}>
            <Header4Text color={tokens.textMedium}>On</Header4Text>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={16} color={tokens.textMedium} />
              <SubBodyText color={tokens.textMedium} style={styles.rowText}>{getDate(eventDate, false)}</SubBodyText>
            </View>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={16} color={tokens.textMedium} />
              <SubBodyText color={tokens.textMedium} style={styles.rowText}>
                {getTime(eventDate)}{eventEndDate ? ` - ${getTime(eventEndDate)}` : ""}
              </SubBodyText>
            </View>
          </View>

          {attendees.length > 0 && (
            <View style={styles.section}>
              <Header4Text color={tokens.textMedium}>With</Header4Text>
              <View style={styles.attendeeList}>
                {attendees.map((person) => (
                  <AttendeeRow
                    key={person.id}
                    person={person}
                    textColor={tokens.onContainerMedium}
                    bgColor={tokens.containerMedium}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.locationRow}>
              <View style={styles.locationText}>
                <Header4Text color={tokens.textMedium}>{location.name}</Header4Text>
                <SubBodyText color={tokens.textMedium}>{location.address}</SubBodyText>
              </View>
              <TouchableOpacity onPress={() => openMap({ query: event.location, provider: "google" })}>
                <Ionicons name="map-outline" size={16} color={tokens.textMedium} />
              </TouchableOpacity>
            </View>
            <StaticMapImage
              lat={event.locationLat}
              lng={event.locationLng}
              address={event.location}
              style={styles.map}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: tokens.background, paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <LargeButton
          color="green"
          onPress={createEvent}
          leadingIcon={<Ionicons name="add" size={16} color={tokens.onPrimary} />}
        >
          Create event
        </LargeButton>
        <LargeButton
          outlined
          color={tokens.outline}
          onPress={dismissRecommendation}
          disabled={dismissing}
          leadingIcon={<Ionicons name="close" size={16} color={tokens.outline} />}
        >
          {dismissing ? "Dismissing..." : "Dismiss recommendation"}
        </LargeButton>
      </View>

      <RecommendationInfoDialog
        visible={infoVisible}
        onDismiss={closeInfo}
        onGoToSettings={goToRecommendationSettings}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  card: {
    width: "100%",
    borderWidth: 2.5,
    borderStyle: "dashed",
    borderRadius: radiusTokens.large,
    padding: radiusTokens.extraLarge,
    gap: radiusTokens.extraLarge,
  },
  section: {
    gap: 15,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowText: {
    marginLeft: 6,
  },
  attendeeList: {
    gap: 10,
    width: "100%",
  },
  attendeeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    height: 42,
    borderRadius: radiusTokens.small,
    paddingHorizontal: 12,
  },
  attendeeAvatar: {
    width: 26,
    height: 25,
    borderRadius: 25,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
  },
  locationText: {
    flex: 1,
  },
  map: {
    height: 175,
    opacity: 0.8,
  },
  footer: {
    flexDirection: "column",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: radiusTokens.medium,
    borderTopRightRadius: radiusTokens.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
  },
});

export default Recommendation;
