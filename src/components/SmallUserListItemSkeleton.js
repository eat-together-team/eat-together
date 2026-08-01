import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches SmallUserListItem's layout (avatar size, row height) so search
// results don't jump around once real rows replace these.
const SmallUserListItemSkeleton = () => {
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
      <View style={[styles.bar, blockStyle]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 19,
    height: 60,
    width: "100%",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bar: {
    flex: 1,
    height: 14,
    borderRadius: 7,
  },
});

export default SmallUserListItemSkeleton;
