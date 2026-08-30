import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { CARD_SIZE } from "./EventPhotoCard";

const CARD_COUNT = 6;

// Matches the Event photos grid's card size/spacing so the page doesn't
// jump once real photos replace these.
const EventGallerySkeleton = () => {
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

  return (
    <Animated.View style={[styles.grid, { opacity }]}>
      {Array.from({ length: CARD_COUNT }).map((_, index) => (
        <View key={index} style={[styles.card, { backgroundColor: tokens.containerMedium }]} />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  grid: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radiusTokens.small,
  },
});

export default EventGallerySkeleton;
