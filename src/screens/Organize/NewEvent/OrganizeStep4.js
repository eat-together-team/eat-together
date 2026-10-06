// Step 4 of the new-event wizard — a read-only review of everything
// entered in steps 1-3, ending in the real "Post" action (submission is
// handled by OrganizeFlow.js's handlePost, this component just displays).

import React from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import openMap from "react-native-open-maps";

import { colorTokens } from "../../../theme/colorTokens";
import { radiusTokens } from "../../../theme/radiusTokens";
import { useTheme } from "../../../rapi_ui_components";
import Header2Text from "../../../components/typography/Header2Text";
import Header4Text from "../../../components/typography/Header4Text";
import SubBodyText from "../../../components/typography/SubBodyText";
import AboutChip from "../../../components/AboutChip";
import getTime from "../../../utils/getTime";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const formatDate = (date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

export default function OrganizeStep4({ title, image, description, tags, type, date, startTime, endTime, location }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: tokens.containerLow }]}>
          <Ionicons name="images-outline" size={32} color={tokens.textLight} />
        </View>
      )}

      <View style={styles.titleBlock}>
        <Header2Text color={tokens.onBackground}>{title}</Header2Text>
        {!!description && <SubBodyText color={tokens.onBackground}>{description}</SubBodyText>}
      </View>

      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((tag) => (
            <AboutChip key={tag} text={tag} color="Purple" type="Display" />
          ))}
        </View>
      )}

      <View style={styles.metaBlock}>
        <View style={styles.metaRow}>
          <Ionicons name="lock-closed-outline" size={16} color={tokens.onBackground} />
          <SubBodyText color={tokens.onBackground} style={styles.metaText}>
            {type === "public" ? "Public event" : "Private event"}
          </SubBodyText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={tokens.onBackground} />
          <SubBodyText color={tokens.onBackground} style={styles.metaText}>
            {formatDate(date)}
          </SubBodyText>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={16} color={tokens.onBackground} />
          <SubBodyText color={tokens.onBackground} style={styles.metaText}>
            {getTime(startTime)} - {getTime(endTime)}
          </SubBodyText>
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationText}>
          <Header4Text color={tokens.onBackground}>{location.name}</Header4Text>
          <SubBodyText color={tokens.textMedium}>{location.address}</SubBodyText>
        </View>
        <TouchableOpacity onPress={() => openMap({ query: location.address, provider: "google" })} hitSlop={8}>
          <Ionicons name="map-outline" size={16} color={tokens.onBackground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 18,
  },
  image: {
    width: "100%",
    height: 207,
    borderRadius: radiusTokens.small,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    gap: 8,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaBlock: {
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    marginLeft: 22,
    opacity: 0.8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationText: {
    gap: 2,
  },
});
