import React from "react";
import { View, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import getDate from "../utils/getDate";

const foodBackground = require("../../assets/foodBackground.png");

// Compact horizontal-scroll card for the Explore feed's "Events" row —
// distinct from the full EventCard used on the meals list, which has room
// for host name/location/time.
const EventPreviewCard = ({ event, onPress }) => {
  const eventDate = event.startDate
    ? event.startDate.toDate()
    : event.date
    ? event.date.toDate()
    : null;
  // No day-of-week here (unlike EventsRow) — the card is only 154px wide, too
  // narrow for "Monday, Jul. 20" to fit on one line.
  const formattedDate = eventDate ? getDate(eventDate, false) : "";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <ImageBackground
        source={event.hasImage && event.image ? { uri: event.image } : foodBackground}
        style={styles.image}
        imageStyle={styles.imageRadius}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)", "rgba(0,0,0,0.8)"]}
          locations={[0, 0.394, 1]}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <Header4Text color="white" numberOfLines={1}>
            {event.name || "Event"}
          </Header4Text>
          {formattedDate && (
            <SubBodyText color="white" style={styles.date} numberOfLines={1}>
              {formattedDate}
            </SubBodyText>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 154,
    height: 158,
  },
  image: {
    width: 154,
    height: 158,
    justifyContent: "flex-end",
  },
  imageRadius: {
    borderRadius: 10,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 65,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  content: {
    padding: 8,
  },
  date: {
    fontSize: 11,
    marginTop: 1,
  },
});

export default EventPreviewCard;
