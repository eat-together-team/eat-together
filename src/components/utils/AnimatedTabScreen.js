//Fades a tab's screen in each time it becomes focused via the bottom nav bar.
//bottom-tabs v6 dropped the old animationEnabled option and has no built-in
//transition, and keeps inactive tabs mounted (rather than unmounting them),
//so this replays a fade on focus instead of relying on a mount animation.
//Uses the built-in Animated API rather than react-native-reanimated, since
//reanimated 4 requires the New Architecture to actually be compiled into the
//native app, which this build doesn't have yet.

import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export default function AnimatedTabScreen({ children }) {
  const isFocused = useIsFocused();
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    if (isFocused) {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  return (
    <Animated.View style={{ flex: 1, opacity }}>{children}</Animated.View>
  );
}
