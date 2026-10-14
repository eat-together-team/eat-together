//Wraps a tab bar item with an unbounded, grainy Material 3-style ripple
//that grows from the item's center (not the touch point) without being
//clipped to the item's bounds.
//
//The grain texture is pre-baked in the exact color needed (green for
//"primary", near-black/near-white for "neutral") rather than tinted at
//runtime — Image's tintColor didn't reliably recolor it, and layering a
//MaskedView to mask a colored fill doesn't render on Android when nested
//inside an animated (scaled/opacity) parent, a known limitation of
//@react-native-masked-view on that platform.

import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable } from "react-native";
import { useTheme } from "../../rapi_ui_components";

const grainPrimary = require("../../../assets/icons/ripple-grain.png");
const grainDark = require("../../../assets/icons/ripple-grain-dark.png");
const grainLight = require("../../../assets/icons/ripple-grain-light.png");

const RIPPLE_DIAMETER = 120;
const RIPPLE_PEAK_OPACITY = 0.3;

export default React.forwardRef(function RippleTouchable({
  onPress,
  onLongPress,
  style,
  variant = "primary",
  children,
}, ref) {
  const { theme } = useTheme();
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    scale.setValue(0);
    opacity.setValue(RIPPLE_PEAK_OPACITY);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const centerX = layout.width / 2;
  const centerY = layout.height / 2;
  const grainTexture =
    variant === "neutral" ? (theme === "dark" ? grainLight : grainDark) : grainPrimary;

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onLayout={(e) => setLayout(e.nativeEvent.layout)}
      style={style}
    >
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: centerX - RIPPLE_DIAMETER / 2,
          top: centerY - RIPPLE_DIAMETER / 2,
          width: RIPPLE_DIAMETER,
          height: RIPPLE_DIAMETER,
          borderRadius: RIPPLE_DIAMETER / 2,
          overflow: "hidden",
          opacity,
          transform: [{ scale }],
        }}
      >
        <Image
          source={grainTexture}
          style={{ width: RIPPLE_DIAMETER, height: RIPPLE_DIAMETER }}
          resizeMode="cover"
        />
      </Animated.View>
    </Pressable>
  );
});
