import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches SuggestedPersonRow's exact layout (avatar size, gaps) so the list
// doesn't jump around once real rows replace these.
const SuggestedPersonRowSkeleton = () => {
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
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.avatar, blockStyle]} />
      <View style={styles.content}>
        <View style={[styles.nameBar, blockStyle]} />
        <View style={[styles.quoteBar, blockStyle]} />
        <View style={styles.tags}>
          <View style={[styles.tagBar, blockStyle, { width: 90 }]} />
          <View style={[styles.tagBar, blockStyle, { width: 70 }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    // Matches SuggestedPersonRow's content gap exactly (6, not 8) so the
    // skeleton's overall height lines up with the real row and nothing
    // shifts when it swaps in.
    gap: 6,
  },
  nameBar: {
    width: "60%",
    height: 16,
    borderRadius: 8,
  },
  quoteBar: {
    width: "45%",
    height: 15,
    borderRadius: 7,
  },
  tags: {
    flexDirection: "row",
    gap: 5,
  },
  tagBar: {
    // Matches AboutChip's real rendered height (7px vertical padding +
    // 11px text) instead of an arbitrary shorter pill.
    height: 27,
    borderRadius: 14,
  },
});

export default SuggestedPersonRowSkeleton;
