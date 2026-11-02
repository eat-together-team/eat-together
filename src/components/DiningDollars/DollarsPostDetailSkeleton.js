import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";

const LIST_ROWS = 3;

// Loading state for DollarsPostDetail: header block, then two list sections
// shaped like the locations / payment method rows.
const DollarsPostDetailSkeleton = () => {
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

  const listSection = (key) => (
    <View key={key} style={styles.section}>
      <View style={[styles.sectionTitle, blockStyle]} />
      {Array.from({ length: LIST_ROWS }).map((_, index) => (
        <View key={index} style={[styles.listRow, blockStyle]} />
      ))}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.header}>
        <View style={[styles.chip, blockStyle]} />
        <View style={styles.posterRow}>
          <View style={[styles.avatar, blockStyle]} />
          <View style={[styles.nameBar, blockStyle]} />
        </View>
        <View style={[styles.headlineBar, blockStyle]} />
        <View style={[styles.dateBar, blockStyle]} />
      </View>
      {listSection("locations")}
      {listSection("payments")}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 25 },
  header: { gap: 10 },
  chip: { width: 64, height: 22, borderRadius: 11 },
  posterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  nameBar: { width: "40%", height: 14, borderRadius: 7 },
  headlineBar: { width: "65%", height: 26, borderRadius: 13 },
  dateBar: { width: "50%", height: 12, borderRadius: 6 },
  section: { gap: 10 },
  sectionTitle: { width: "35%", height: 14, borderRadius: 7 },
  listRow: { height: 42, borderRadius: radiusTokens.small },
});

export default DollarsPostDetailSkeleton;
