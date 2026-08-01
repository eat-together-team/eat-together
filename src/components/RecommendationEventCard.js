import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header3Text from "./typography/Header3Text";
import Header4Text from "./typography/Header4Text";
import AttendeeAvatarStack from "./AttendeeAvatarStack";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";
import getDate from "../utils/getDate";
import getTime from "../utils/getTime";

// AI-curated meetup suggestion — a dashed placeholder card (no photo, no
// individual host) distinct from EventListingCard's real, user-hosted
// events. Backed by a "Private Events" doc referenced from the user's
// notifications (see AllEvents.js), same shape Home.js already fetches.
const RecommendationEventCard = ({ event, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const eventDate = event.startDate ? event.startDate.toDate() : event.date.toDate();

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: tokens.outline }]}
      onPress={() => onPress(event)}
      activeOpacity={0.85}
    >
      <View style={styles.labelRow}>
        <Ionicons name="sparkles" size={20} color={tokens.outline} />
        <Header4Text color={tokens.outline}>Recommendation</Header4Text>
      </View>

      <View style={styles.content}>
        <Header3Text color={tokens.outline}>{event.name}</Header3Text>

        <View style={styles.metaRow}>
          <Header4Text color={tokens.outline}>{getDate(eventDate, false)}</Header4Text>
          <View style={[styles.dot, { backgroundColor: tokens.outline }]} />
          <Header4Text color={tokens.outline}>{getTime(eventDate)}</Header4Text>
          <View style={[styles.dot, { backgroundColor: tokens.outline }]} />
          <Header4Text color={tokens.outline} numberOfLines={1} style={styles.location}>
            {event.location}
          </Header4Text>
        </View>

        <View style={styles.bottomRow}>
          <AttendeeAvatarStack attendeeIds={event.suggestedAttendees || []} textColor={tokens.outline} />
          <View style={[styles.dot, { backgroundColor: tokens.outline }]} />
          <Header4Text color={tokens.outline}>Eat Together</Header4Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radiusTokens.medium,
    padding: 20,
    gap: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  content: {
    gap: 5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  location: {
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default React.memo(RecommendationEventCard);
