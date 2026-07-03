//Wraps a tab bar item with an unbounded, grainy Material 3-style ripple
//that grows from the item's center (not the touch point) without being
//clipped to the item's bounds. The grain texture's alpha channel masks
//a solid color fill so the ripple color can be swapped per item.

import React, { useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, View } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";

const grainTexture = require("../../../assets/icons/ripple-grain.png");

const RIPPLE_DIAMETER = 120;
const RIPPLE_PEAK_OPACITY = 0.3;

export default function RippleTouchable({
  onPress,
  onLongPress,
  style,
  color,
  children,
}) {
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

  return (
    <Pressable
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
        <MaskedView
          style={{ width: RIPPLE_DIAMETER, height: RIPPLE_DIAMETER }}
          maskElement={
            <Image
              source={grainTexture}
              style={{ width: RIPPLE_DIAMETER, height: RIPPLE_DIAMETER }}
              resizeMode="cover"
            />
          }
        >
          <View style={{ flex: 1, backgroundColor: color }} />
        </MaskedView>
      </Animated.View>
    </Pressable>
  );
}
