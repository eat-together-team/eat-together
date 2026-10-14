import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const EventPreviewCardSkeleton = () => {
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
    <Animated.View style={[styles.card, { backgroundColor: tokens.containerMedium, opacity }]} />
  );
};

const styles = StyleSheet.create({
  card: {
    width: 154,
    height: 158,
    borderRadius: 10,
  },
});

export default EventPreviewCardSkeleton;
