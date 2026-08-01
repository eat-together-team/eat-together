// Drives the "genie" expand transition played when the Event pill in the
// bottom tab bar is pressed: a copy of the pill grows to fill the whole
// screen, then dissolves to reveal the real Organize (new event) screen
// underneath, which has already switched focus and faded in via
// AnimatedTabScreen while the overlay was covering it.
//
// Lives above NavigationContainer (see AppNavigator.js) so the coordinates
// returned by measureInWindow() line up with this overlay's absolute
// positioning with no offset to account for.
//
// Uses the core Animated API rather than react-native-reanimated: this repo
// has hit repeated worklet crashes with reanimated/gesture-handler (see
// ChatRoom.js/ImageViewer.js), and AnimatedTabScreen avoids it for the same
// reason. The growing shape itself is driven purely via `transform`
// (translate + scale) and `opacity`, both native-driver-compatible, so the
// expand stays smooth on the UI thread regardless of what the JS thread is
// doing while the new screen mounts underneath — animating width/height/
// left/top directly (the first version of this) can't use the native
// driver and visibly stutters under that same JS work. Only the subtle
// border-radius easing needs a second, JS-driven Animated.Value, since
// borderRadius itself isn't a native-driver-compatible property.

import React, { createContext, useContext, useRef, useState } from "react";
import { Animated, Easing, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

const GenieTransitionContext = createContext(null);

const DURATION = 550;
const EASING = Easing.out(Easing.cubic);

export function useGenieTransition() {
  return useContext(GenieTransitionContext);
}

export default function GenieTransitionProvider({ children }) {
  const [origin, setOrigin] = useState(null);
  const [visible, setVisible] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const radiusProgress = useRef(new Animated.Value(0)).current;

  const trigger = (rect) => {
    setOrigin(rect);
    setVisible(true);
    progress.setValue(0);
    radiusProgress.setValue(0);
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: EASING,
        useNativeDriver: true,
      }),
      Animated.timing(radiusProgress, {
        toValue: 1,
        duration: DURATION,
        easing: EASING,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  return (
    <GenieTransitionContext.Provider value={trigger}>
      <View style={{ flex: 1 }}>
        {children}
        {visible && (
          <GenieOverlay progress={progress} radiusProgress={radiusProgress} origin={origin} />
        )}
      </View>
    </GenieTransitionContext.Provider>
  );
}

function GenieOverlay({ progress, radiusProgress, origin }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const { width, height } = useWindowDimensions();

  if (!origin) return null;

  // The shape is laid out at its final full-screen size/position from the
  // very first frame; at progress=0 it's made to LOOK like the small pill
  // purely via transform (scaled down + shifted so its center lands on the
  // pill's center), then animates to the identity transform. Since
  // translateX/Y here are listed before scaleX/Y, they're applied in raw
  // (unscaled) pixels — the standard RN/CSS transform-list convention —
  // so the growth reads as a clean expand rather than an amplified drift.
  const scaleX0 = origin.width / width;
  const scaleY0 = origin.height / height;
  const translateX0 = origin.x + origin.width / 2 - width / 2;
  const translateY0 = origin.y + origin.height / 2 - height / 2;

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [translateX0, 0] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [translateY0, 0] });
  const scaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [scaleX0, 1] });
  const scaleY = progress.interpolate({ inputRange: [0, 1], outputRange: [scaleY0, 1] });
  const borderRadius = radiusProgress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  // Once the shape has fully covered the screen, dissolve to reveal the
  // real Organize screen (already focused/faded-in underneath) at the
  // exact same full-screen bounds.
  const shapeOpacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });
  // The pill's icon/label live in a separate, unscaled overlay pinned to
  // the pill's real on-screen rect (rather than as children of the
  // scaling shape above, which would squash them by its very non-uniform
  // scaleX/scaleY). They just fade/pop away early, like being sucked into
  // the shape as it starts expanding.
  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 0, 0],
  });
  const contentScale = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [1, 1.15, 1.15],
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          borderRadius,
          backgroundColor: tokens.primary,
          opacity: shapeOpacity,
          transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: origin.x,
          top: origin.y,
          width: origin.width,
          height: origin.height,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: contentOpacity,
          transform: [{ scale: contentScale }],
        }}
      >
        <Ionicons name="add" size={26} color={tokens.onPrimary} />
        <Text fontWeight="bold" style={{ color: tokens.onPrimary, fontSize: 15 }}>
          Event
        </Text>
      </Animated.View>
    </>
  );
}
