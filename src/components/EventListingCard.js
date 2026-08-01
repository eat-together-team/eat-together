import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import Header3Text from "./typography/Header3Text";
import Header4Text from "./typography/Header4Text";
import AttendeeAvatarStack from "./AttendeeAvatarStack";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";
import getDate from "../utils/getDate";
import getTime from "../utils/getTime";

const foodBackground = require("../../assets/foodBackground.png");

// Matches the page's 20px horizontal padding on both sides — same explicit
// pixel-size approach as PromoImageCard.js (percentage width + Yoga doesn't
// combine reliably with an image's own layout needs here either).
const CARD_WIDTH = Dimensions.get("window").width - 40;

const Dot = ({ color }) => <View style={[styles.dot, { backgroundColor: color }]} />;

// Full event card — photo, title, date/time/location, attendee avatars +
// host name. Used for both the main Events browse list and search results.
// Memoized (same reasoning as SuggestedPersonRow/SmallUserListItem): the
// Events list can render many of these, and a stable onPress reference from
// the parent lets unrelated screen-state changes skip re-rendering them.
const EventListingCard = ({ event, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const eventDate = event.startDate ? event.startDate.toDate() : event.date.toDate();
  const hostName = event.hostFirstName
    ? `${event.hostFirstName} ${event.hostLastName.substring(0, 1)}.`
    : event.hostName;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(event)} activeOpacity={0.85}>
      <Image
        source={event.hasImage && event.image ? { uri: event.image } : foodBackground}
        style={styles.image}
      />

      <View style={styles.content}>
        <Header3Text color={tokens.onBackground}>{event.name}</Header3Text>

        <View style={styles.metaRow}>
          <Header4Text color={tokens.textMedium}>{getDate(eventDate, false)}</Header4Text>
          <Dot color={tokens.textMedium} />
          <Header4Text color={tokens.textMedium}>{getTime(eventDate)}</Header4Text>
          <Dot color={tokens.textMedium} />
          <Header4Text color={tokens.textMedium} numberOfLines={1} style={styles.location}>
            {event.location}
          </Header4Text>
        </View>

        <View style={styles.bottomRow}>
          <AttendeeAvatarStack attendeeIds={event.attendees || []} textColor={tokens.textMedium} />
          {hostName && (
            <>
              <Dot color={tokens.textMedium} />
              <Header4Text color={tokens.textMedium}>{hostName}</Header4Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    gap: 7,
  },
  image: {
    width: CARD_WIDTH,
    height: 198,
    borderRadius: 12,
  },
  content: {
    paddingHorizontal: 10,
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

export default React.memo(EventListingCard);
