import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const CARD_WIDTH = Dimensions.get("window").width - 40;

// Matches EventListingCard's exact dimensions (image height, title/meta bar
// sizes, bottom-row split) so the list doesn't jump once real cards replace
// these.
const EventListingCardSkeleton = () => {
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
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={[styles.image, blockStyle]} />
      <View style={styles.content}>
        <View style={[styles.titleBar, blockStyle]} />
        <View style={[styles.metaBar, blockStyle]} />
        <View style={styles.bottomRow}>
          <View style={[styles.attendeesBar, blockStyle]} />
          <View style={[styles.hostBar, blockStyle]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    gap: 7,
  },
  image: {
    width: CARD_WIDTH,
    height: 198,
    borderRadius: 12,
  },
  content: {
    paddingHorizontal: 10,
    gap: 8,
  },
  titleBar: {
    width: "45%",
    height: 24,
    borderRadius: 12,
  },
  metaBar: {
    width: "70%",
    height: 14,
    borderRadius: 7,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendeesBar: {
    width: "65%",
    height: 14,
    borderRadius: 7,
  },
  hostBar: {
    width: 47,
    height: 24,
    borderRadius: 12,
  },
});

export default EventListingCardSkeleton;
