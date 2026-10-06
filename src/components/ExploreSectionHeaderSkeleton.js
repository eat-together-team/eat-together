import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches ExploreSectionHeader's layout so sections don't jump around once
// the real title/"View all" text replaces these.
const ExploreSectionHeaderSkeleton = () => {
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
      <View style={[styles.titleBar, blockStyle]} />
      <View style={[styles.viewAllBar, blockStyle]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleBar: {
    width: 94,
    height: 15,
    borderRadius: 7,
  },
  viewAllBar: {
    width: 44,
    height: 15,
    borderRadius: 7,
  },
});

export default ExploreSectionHeaderSkeleton;
