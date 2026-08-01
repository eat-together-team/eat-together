import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches the quick-filter FilterChip row's height/gap so the layout
// doesn't jump once the real chips (Mutual friends, Similar interests,
// the user's own tags) replace these.
const QuickFilterChipsSkeleton = () => {
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
      <View style={[styles.chip, blockStyle, { width: 100 }]} />
      <View style={[styles.chip, blockStyle, { width: 140 }]} />
      <View style={[styles.chip, blockStyle, { width: 90 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    height: 29,
  },
  chip: {
    height: 29,
    borderRadius: 15,
  },
});

export default QuickFilterChipsSkeleton;
