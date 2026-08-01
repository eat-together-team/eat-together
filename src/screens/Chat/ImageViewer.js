// Full-screen image viewer for chat photos — reached as a real navigated
// screen (not a <Modal>) so it picks up the app's normal native-stack slide
// transition instead of the OS's own modal presentation.
//
// Pinch/pan/dismiss are built on plain PanResponder + Animated (no
// react-native-gesture-handler Gesture API, no Reanimated shared values) —
// this project's react-native-reanimated/react-native-worklets combo
// reliably crashes ("Tried to synchronously call a non-worklet function
// `addListener` on the UI thread") on ANY code path that touches worklets,
// whether that's a library's internals (ReanimatedSwipeable,
// react-native-keyboard-controller) or hand-written Gesture API code — so
// this sticks to the zero-worklet approach already proven stable elsewhere
// in this app (ChatPreview's swipe-to-delete).

import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.2;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const distanceBetween = (touches) => {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};

export default function ImageViewer({ route, navigation }) {
  const { uri } = route.params;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Committed values from the end of the previous gesture.
  const baseScale = useRef(1);
  const baseTranslate = useRef({ x: 0, y: 0 });

  // Re-derived every time the active touch count changes (1 finger <-> 2
  // fingers) rather than only once at gesture start, since that's the bug
  // that made pinch never work at all: the baseline distance/position has
  // to be recaptured at the exact moment a second finger lands, not back
  // when the very first finger touched down.
  const touchState = useRef({ mode: "none" });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        touchState.current = { mode: "none" };
      },
      onPanResponderMove: (evt) => {
        const touches = evt.nativeEvent.touches;
        const state = touchState.current;

        if (touches.length === 2) {
          const distance = distanceBetween(touches);
          if (state.mode !== "pinch") {
            touchState.current = { mode: "pinch", startDistance: distance, startScale: baseScale.current };
          } else {
            const nextScale = clamp(
              state.startScale * (distance / state.startDistance),
              MIN_SCALE,
              MAX_SCALE
            );
            scale.setValue(nextScale);
          }
        } else if (touches.length === 1 && baseScale.current > MIN_SCALE) {
          const touch = touches[0];
          if (state.mode !== "pan") {
            touchState.current = {
              mode: "pan",
              startX: touch.pageX,
              startY: touch.pageY,
              startTranslateX: baseTranslate.current.x,
              startTranslateY: baseTranslate.current.y,
            };
          } else {
            const maxOffsetX = (SCREEN_WIDTH * (baseScale.current - 1)) / 2;
            const maxOffsetY = (SCREEN_HEIGHT * (baseScale.current - 1)) / 2;
            translateX.setValue(
              clamp(state.startTranslateX + (touch.pageX - state.startX), -maxOffsetX, maxOffsetX)
            );
            translateY.setValue(
              clamp(state.startTranslateY + (touch.pageY - state.startY), -maxOffsetY, maxOffsetY)
            );
          }
        } else if (touches.length === 1) {
          // Not zoomed in — a single-finger drag slides the whole image
          // down to dismiss instead.
          const touch = touches[0];
          if (state.mode !== "dismiss") {
            touchState.current = { mode: "dismiss", startY: touch.pageY, lastDy: 0 };
          } else {
            const dy = touch.pageY - state.startY;
            touchState.current = { ...state, lastDy: dy };
            translateY.setValue(dy);
          }
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const state = touchState.current;

        if (state.mode === "pinch") {
          scale.stopAnimation((currentScale) => {
            baseScale.current = clamp(currentScale, MIN_SCALE, MAX_SCALE);
            if (currentScale < MIN_SCALE) {
              Animated.spring(scale, { toValue: MIN_SCALE, useNativeDriver: true }).start();
            }
            if (baseScale.current <= MIN_SCALE) {
              baseTranslate.current = { x: 0, y: 0 };
              Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
            }
          });
        } else if (state.mode === "pan") {
          translateX.stopAnimation((x) => {
            baseTranslate.current.x = x;
          });
          translateY.stopAnimation((y) => {
            baseTranslate.current.y = y;
          });
        } else if (state.mode === "dismiss") {
          if (state.lastDy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
            navigation.goBack();
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
          }
        }

        touchState.current = { mode: "none" };
      },
    })
  ).current;

  return (
    <Layout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={23} color={tokens.onBackground} />
        </TouchableOpacity>
      </View>

      <View style={styles.body} {...panResponder.panHandlers}>
        <Animated.View style={{ transform: [{ translateX }, { translateY }, { scale }] }}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
});
