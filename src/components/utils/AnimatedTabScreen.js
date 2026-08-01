//Fades a tab's screen in each time it becomes focused via the bottom nav bar.
//bottom-tabs v6 dropped the old animationEnabled option and has no built-in
//transition, and keeps inactive tabs mounted (rather than unmounting them),
//so this replays a fade on focus instead of relying on a mount animation.
//Uses the built-in Animated API rather than react-native-reanimated, since
//reanimated 4 requires the New Architecture to actually be compiled into the
//native app, which this build doesn't have yet.

import React, { useEffect, useRef } from "react";
import { Animated, StatusBar } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useTheme } from "../../provider/ThemeProvider";

export default function AnimatedTabScreen({ children }) {
  const isFocused = useIsFocused();
  const { theme } = useTheme();
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
    <Animated.View style={{ flex: 1, opacity }}>
      {/* Reasserts the theme's status bar style on every tab focus, since
          screens like FullProfile/Me hardcode a light-content override for
          their own hero image and RN's StatusBar doesn't revert it once
          that screen is left mounted in the background. */}
      {isFocused && (
        <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
      )}
      {children}
    </Animated.View>
  );
}
