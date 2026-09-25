import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import RestaurantCardSkeleton from "./RestaurantCardSkeleton";

// Matches Me.js/FullProfile.js's loaded layout (name/photo, connections,
// buttons, the three tag sections around the fun fact, gallery, favorite
// restaurants) so the page doesn't jump once real content replaces it. The
// gallery row uses the same 150x150 tile size as GalleryRow; the favorite
// restaurants section reuses RestaurantCardSkeleton (matching
// CompactRestaurantCard's wide row, sliced to 2, same as the real section).
const ProfileSkeleton = () => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const block = { backgroundColor: tokens.containerMedium };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.header}>
        <View style={styles.name}>
          <View style={[styles.nameBar, block]} />
          <View style={[styles.usernameBar, block]} />
          <View style={styles.lines}>
            <View style={[styles.line, block, { width: 110 }]} />
            <View style={[styles.line, block, { width: 140 }]} />
            <View style={[styles.line, block, { width: 125 }]} />
          </View>
        </View>
        <View style={[styles.avatar, block]} />
      </View>

      <View style={[styles.connectionsBar, block]} />

      <View style={[styles.button, block]} />

      <View style={[styles.tagSection, block]} />
      <View style={[styles.tagSection, block]} />

      <View style={styles.quoteLines}>
        <View style={[styles.quoteLine, block, { width: "80%" }]} />
        <View style={[styles.quoteLine, block, { width: "65%" }]} />
        <View style={[styles.quoteLine, block, { width: "70%" }]} />
      </View>

      <View style={[styles.tagSection, block]} />

      <View style={styles.sectionHeader}>
        <View style={[styles.labelBar, block]} />
        <View style={[styles.viewAllBar, block]} />
      </View>
      <View style={styles.tileRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.tile, block]} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <View style={[styles.labelBar, block]} />
        <View style={[styles.viewAllBar, block]} />
      </View>
      <View style={styles.favoritesList}>
        <RestaurantCardSkeleton />
        <RestaurantCardSkeleton />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    marginRight: 20,
    gap: 8,
  },
  nameBar: {
    width: 150,
    height: 22,
    borderRadius: radiusTokens.extraSmall,
  },
  usernameBar: {
    width: 100,
    height: 14,
    borderRadius: radiusTokens.extraSmall,
    marginBottom: 4,
  },
  lines: {
    gap: 6,
  },
  line: {
    height: 12,
    borderRadius: radiusTokens.extraSmall,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  connectionsBar: {
    width: 110,
    height: 14,
    borderRadius: radiusTokens.extraSmall,
  },
  button: {
    width: "100%",
    height: 44,
    borderRadius: radiusTokens.small,
  },
  tagSection: {
    width: "100%",
    height: 100,
    borderRadius: radiusTokens.medium,
  },
  quoteLines: {
    gap: 8,
    alignItems: "center",
  },
  quoteLine: {
    height: 14,
    borderRadius: radiusTokens.extraSmall,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelBar: {
    width: 70,
    height: 16,
    borderRadius: radiusTokens.extraSmall,
  },
  viewAllBar: {
    width: 50,
    height: 14,
    borderRadius: radiusTokens.extraSmall,
  },
  tileRow: {
    flexDirection: "row",
    gap: 10,
  },
  tile: {
    width: 110,
    height: 110,
    borderRadius: radiusTokens.small,
  },
  favoritesList: {
    gap: 10,
  },
});

export default ProfileSkeleton;
