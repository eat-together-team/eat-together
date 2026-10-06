import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Loading placeholder for one notifications category: a header bar plus two
// rows. The screen renders four of these, matching Figma's loading frame.
//
// Row geometry deliberately matches NotificationRow's real one (63pt avatar,
// 18pt gap, 10pt vertical padding) rather than the slightly shorter row in
// the Figma loading frame — so the list doesn't jump when content lands,
// same reasoning as UserListItemSkeleton.
const NotificationSectionSkeleton = ({ rows = 2 }) => {
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
    <Animated.View style={[styles.section, { opacity }]}>
      <View style={[styles.header, blockStyle]} />
      <View style={styles.rows}>
        {Array.from({ length: rows }).map((_, index) => (
          <View key={index} style={styles.row}>
            <View style={[styles.avatar, blockStyle]} />
            <View style={styles.content}>
              <View style={[styles.titleBar, blockStyle]} />
              <View style={[styles.bodyBar, blockStyle]} />
              <View style={[styles.bodyBar, blockStyle]} />
            </View>
            <View style={[styles.pill, blockStyle]} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  header: {
    width: 146,
    height: 19,
    borderRadius: 8,
  },
  rows: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleBar: {
    width: 101,
    height: 18,
    borderRadius: 9,
  },
  bodyBar: {
    height: 11,
    borderRadius: 6,
  },
  pill: {
    width: 88,
    height: 37,
    borderRadius: 14,
  },
});

export default NotificationSectionSkeleton;
