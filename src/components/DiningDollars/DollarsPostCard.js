import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header3Text from "../typography/Header3Text";
import Header4Text from "../typography/Header4Text";
import SubBodyText from "../typography/SubBodyText";
import ProfilePic from "../ProfilePic";
import OutlinePillButton from "../OutlinePillButton";
import DollarsPostChip from "./DollarsPostChip";
import DollarsPaymentBadges from "./DollarsPaymentBadges";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import { useTheme } from "../../rapi_ui_components";
import formatRelativeTime from "../../utils/formatRelativeTime";
import { dollarsPostHeadline, formatAvailableUntil } from "../../screens/Explore/DiningDollars/dollarsPostSchema";
import { summarizeDollarsLocations } from "../../screens/Explore/DiningDollars/dollarsConstants";

const Dot = ({ color }) => <View style={[styles.dot, { backgroundColor: color }]} />;

// One dining dollar offer/request in a feed — the central page, search results,
// and both Active exchanges tabs. `chipVariant` comes from viewerChipVariant()
// so the chip reads PENDING / READY once the viewer has a claim. `onEdit`
// adds the "Edit" button shown on My posts. Memoized like EventListingCard.
const DollarsPostCard = ({ post, chipVariant, onPress, onEdit }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const age = formatRelativeTime(post.createdAt);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: tokens.containerLow, borderColor: tokens.containerMedium }]}
      onPress={() => onPress(post)}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <DollarsPostChip variant={chipVariant} />
        {onEdit && (
          <OutlinePillButton label="Edit" color={tokens.primary} onPress={() => onEdit(post)} />
        )}
      </View>

      <View style={styles.posterRow}>
        <ProfilePic uri={post.ownerPhotoUrl} size={24} bordered={false} />
        <Header4Text color={tokens.textMedium} numberOfLines={1} style={styles.posterName}>
          {post.ownerDisplayName}
        </Header4Text>
        {!!age && (
          <>
            <Dot color={tokens.textMedium} />
            <Header4Text color={tokens.textMedium}>{age}</Header4Text>
          </>
        )}
      </View>

      <Header3Text color={tokens.onBackground}>{dollarsPostHeadline(post)}</Header3Text>
      <SubBodyText color={tokens.textMedium}>Available until {formatAvailableUntil(post)}</SubBodyText>

      <View style={styles.bottomRow}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={tokens.textMedium} />
          <SubBodyText color={tokens.textMedium} numberOfLines={1} style={styles.locations}>
            {summarizeDollarsLocations(post.preferredLocations)}
          </SubBodyText>
        </View>
        <DollarsPaymentBadges methods={post.paymentMethods} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radiusTokens.medium,
    padding: 15,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  posterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  posterName: {
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  locations: {
    flexShrink: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default React.memo(DollarsPostCard);
