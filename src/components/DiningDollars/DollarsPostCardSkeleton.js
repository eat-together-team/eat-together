import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

// Matches DollarsPostCard's rows (chip, poster, headline, date, locations +
// badges) so the feed doesn't jump once real cards replace these.
const DollarsPostCardSkeleton = () => {
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

  const blockStyle = { backgroundColor: tokens.containerMedium };

  return (
    <Animated.View
      style={[styles.card, { opacity, backgroundColor: tokens.containerLow, borderColor: tokens.containerMedium }]}
    >
      <View style={[styles.chip, blockStyle]} />
      <View style={styles.posterRow}>
        <View style={[styles.avatar, blockStyle]} />
        <View style={[styles.nameBar, blockStyle]} />
      </View>
      <View style={[styles.headlineBar, blockStyle]} />
      <View style={[styles.dateBar, blockStyle]} />
      <View style={styles.bottomRow}>
        <View style={[styles.locationsBar, blockStyle]} />
        <View style={[styles.badgesBar, blockStyle]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radiusTokens.medium,
    padding: 15,
    gap: 8,
  },
  chip: { width: 64, height: 22, borderRadius: 11 },
  posterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  nameBar: { width: "35%", height: 14, borderRadius: 7 },
  headlineBar: { width: "60%", height: 22, borderRadius: 11 },
  dateBar: { width: "40%", height: 12, borderRadius: 6 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  locationsBar: { width: "55%", height: 12, borderRadius: 6 },
  badgesBar: { width: 70, height: 22, borderRadius: 11 },
});

export default DollarsPostCardSkeleton;
