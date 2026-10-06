import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";

const BAR_WIDTHS = [220, 251, 180, 200, 153, 190];

const ChatMessageSkeleton = ({ align = "left" }) => {
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
    <View style={[styles.row, { alignItems: align === "right" ? "flex-end" : "flex-start" }]}>
      <Animated.View
        style={[styles.bubble, { backgroundColor: tokens.containerLow, opacity }]}
      >
        {BAR_WIDTHS.map((width, index) => (
          <View
            key={index}
            style={[styles.bar, { width, backgroundColor: tokens.containerMedium }]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  bubble: {
    width: 276,
    height: 112,
    borderRadius: radiusTokens.small,
    padding: 13,
    gap: 5,
  },
  bar: {
    height: 10,
    borderRadius: 24,
  },
});

export default ChatMessageSkeleton;
