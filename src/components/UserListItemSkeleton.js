import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches UserListItem's exact layout (avatar size, gaps, padding) so the
// list doesn't jump around once real rows replace these.
const UserListItemSkeleton = () => {
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
    gap: 18,
    paddingVertical: 16,
    paddingStart: 3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  bar: {
    width: "45%",
    height: 14,
    borderRadius: 7,
  },
});

export default UserListItemSkeleton;
