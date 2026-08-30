import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";

// Matches the loaded Event view's block layout (image, title, description,
// tags, logistics rows, location, attendee rows, photo grid) so the page
// doesn't jump once real content replaces it. Reserves space for a photo
// grid even though the "no photos yet" state doesn't render one, since the
// event's photo count isn't known until the attendee/attendance fetch below
// resolves.
const EventViewSkeleton = () => {
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
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={[styles.image, block]} />
      <View style={[styles.titleBar, block]} />

      <View style={styles.lines}>
        <View style={[styles.line, block, { width: 221 }]} />
        <View style={[styles.line, block, { width: 175 }]} />
        <View style={[styles.line, block, { width: 198 }]} />
      </View>

      <View style={styles.tagsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.tag, block]} />
        ))}
      </View>

      <View style={styles.lines}>
        <View style={[styles.line, block, { width: 221 }]} />
        <View style={[styles.line, block, { width: 175 }]} />
        <View style={[styles.line, block, { width: 198 }]} />
      </View>

      <View style={styles.locationSection}>
        <View style={[styles.locationBar, block]} />
        <View style={[styles.mapImage, block]} />
      </View>

      <View style={styles.attendingSection}>
        <View style={[styles.labelBar, block]} />
        <View style={styles.attendeeRows}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.attendeeRow, block]} />
          ))}
        </View>
        <View style={[styles.moreBar, block]} />
      </View>

      <View style={[styles.labelBar, block]} />
      <View style={styles.photosRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.photo, block]} />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 18,
  },
  image: {
    height: 207,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  titleBar: {
    height: 18,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  lines: {
    gap: 8,
  },
  line: {
    height: 10,
    borderRadius: radiusTokens.small,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 12,
  },
  tag: {
    width: 69,
    height: 27,
    borderRadius: radiusTokens.small,
  },
  locationSection: {
    gap: 15,
    width: "100%",
  },
  locationBar: {
    height: 33,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  mapImage: {
    height: 172,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  attendingSection: {
    gap: 10,
    width: "100%",
  },
  labelBar: {
    height: 18,
    width: 102,
    borderRadius: radiusTokens.small,
  },
  attendeeRows: {
    gap: 10,
    width: "100%",
  },
  attendeeRow: {
    height: 42,
    width: "100%",
    borderRadius: radiusTokens.small,
  },
  moreBar: {
    height: 18,
    width: 76,
    borderRadius: radiusTokens.small,
    alignSelf: "center",
  },
  photosRow: {
    flexDirection: "row",
    gap: 10,
  },
  photo: {
    width: 130,
    height: 130,
    borderRadius: radiusTokens.small,
  },
});

export default EventViewSkeleton;
