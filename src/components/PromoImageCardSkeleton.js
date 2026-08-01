import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { PROMO_CARD_WIDTH, PROMO_CARD_HEIGHT } from "./PromoImageCard";

// Matches PromoImageCard's exact dimensions so the Restaurant Picker/Dining
// Dollar Exchange cards don't jump around once the real images replace this.
const PromoImageCardSkeleton = () => {
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
    <Animated.View
      style={{
        width: PROMO_CARD_WIDTH,
        height: PROMO_CARD_HEIGHT,
        borderRadius: 12,
        backgroundColor: tokens.containerMedium,
        opacity,
      }}
    />
  );
};

export default PromoImageCardSkeleton;
