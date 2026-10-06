import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Matches CompactRestaurantCard's exact layout (card height, image width,
// rounding) so the Favorite restaurants list doesn't jump once real cards
// replace these.
const RestaurantCardSkeleton = () => {
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
    <Animated.View style={[styles.card, { borderColor: tokens.containerLow, opacity }]}>
      <View style={[styles.image, block]} />
      <View style={styles.content}>
        <View style={[styles.nameBar, block]} />
        <View style={[styles.categoryBar, block]} />
        <View style={[styles.priceBar, block]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    height: 94,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: "100%",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    gap: 8,
  },
  nameBar: {
    width: "60%",
    height: 15,
    borderRadius: 7,
  },
  categoryBar: {
    width: "40%",
    height: 12,
    borderRadius: 6,
  },
  priceBar: {
    width: "30%",
    height: 13,
    borderRadius: 6,
  },
});

export default RestaurantCardSkeleton;
