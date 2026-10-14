import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const ChatPreviewSkeleton = () => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const blockStyle = { backgroundColor: tokens.containerMedium };

  return (
    <Animated.View style={[styles.row, { opacity }]}>
      <View style={[styles.avatar, blockStyle]} />
      <View style={styles.content}>
        <View style={[styles.titleBar, blockStyle, { width: "65%" }]} />
        <View style={styles.subtitleGroup}>
          <View style={[styles.subtitleBar, blockStyle, { width: "55%" }]} />
          <View style={[styles.subtitleBar, blockStyle, { width: "85%" }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
    width: "100%",
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 10,
  },
  titleBar: {
    height: 14,
    borderRadius: 7,
  },
  subtitleGroup: {
    gap: 6,
  },
  subtitleBar: {
    height: 10,
    borderRadius: 5,
  },
});

export default ChatPreviewSkeleton;
