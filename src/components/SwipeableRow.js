import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Pressable, Animated, PanResponder } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// The swipe-to-delete/archive shell, lifted out of ChatPreview.js so the
// notifications list gets the same gesture without a second copy of it. This
// owns the gesture, the animation and the banner chrome; callers supply the
// row itself plus whatever goes inside each banner (`deleteContent` /
// `archiveContent`), which is what lets chats keep its existing banner
// typography while notifications uses the newer design-system styling.
//
// Built on plain PanResponder rather than react-native-gesture-handler's
// Swipeable, after hitting real bugs with both the classic (Animated-API)
// version (didn't track the gesture smoothly under the New Architecture) and
// ReanimatedSwipeable (crashed: "[Worklets] Tried to synchronously call a
// non-worklet function addListener on the UI thread"). PanResponder is core
// React Native with no Reanimated/worklets involvement at all.
//
// Swipe toward the end (left, revealing the trailing/right side) = delete.
// Swipe toward the start (right, revealing the leading/left side) = archive.
//
// A half swipe settles at a small peek of the action card (tap it to act);
// a full swipe (or a fast enough flick) slides the row all the way off and
// fires the action immediately, no separate tap needed.
const PEEK_RATIO = 0.25;
const PEEK_COMMIT_RATIO = 0.15;
const PEEK_COMMIT_VELOCITY = 0.5;
const DISMISS_COMMIT_RATIO = 0.5;
const DISMISS_COMMIT_VELOCITY = 1.2;

const SwipeableRow = ({
  children,
  onPress,
  onDelete,
  deleteContent,
  onArchive,
  archiveContent,
  contentStyle,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [rowWidth, setRowWidth] = useState(0);

  const rowWidthRef = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const startValueRef = useRef(0);
  const openSideRef = useRef("none"); // "none" | "archive" | "delete"
  // Mirrors openSideRef into render-visible state — both banners are
  // stacked in the same absolute-fill space and an invisible
  // (opacity: 0) TouchableOpacity is still tappable by default, so
  // whichever banner rendered later in JSX would always win taps
  // regardless of which one is actually showing unless pointerEvents is
  // explicitly gated by which side is currently open.
  const [openSide, setOpenSide] = useState("none");
  const canArchive = !!onArchive;
  const canDelete = !!onDelete;

  useEffect(() => {
    rowWidthRef.current = rowWidth;
  }, [rowWidth]);

  const closeRow = () => {
    openSideRef.current = "none";
    setOpenSide("none");
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  // Positive translateX reveals the leading (left) side: archive.
  const peekArchive = () => {
    openSideRef.current = "archive";
    setOpenSide("archive");
    Animated.spring(translateX, {
      toValue: (rowWidthRef.current || 300) * PEEK_RATIO,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  // Negative translateX reveals the trailing (right) side: delete.
  const peekDelete = () => {
    openSideRef.current = "delete";
    setOpenSide("delete");
    Animated.spring(translateX, {
      toValue: -(rowWidthRef.current || 300) * PEEK_RATIO,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  // Slides the row the rest of the way off (past the peek) and fires the
  // action once it's fully out of view — used for both a full swipe and for
  // tapping an already-peeking card, so both paths end the same way.
  const dismissArchive = () => {
    openSideRef.current = "archive";
    setOpenSide("archive");
    Animated.timing(translateX, {
      toValue: rowWidthRef.current || 300,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onArchive?.();
    });
  };

  const dismissDelete = () => {
    openSideRef.current = "delete";
    setOpenSide("delete");
    Animated.timing(translateX, {
      toValue: -(rowWidthRef.current || 300),
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDelete?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        !disabled &&
        Math.abs(gesture.dx) > 10 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.stopAnimation((value) => {
          startValueRef.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const maxSwipe = rowWidthRef.current || 300;
        const minBound = canDelete ? -maxSwipe : 0;
        const maxBound = canArchive ? maxSwipe : 0;
        const next = Math.min(
          maxBound,
          Math.max(minBound, startValueRef.current + gesture.dx)
        );
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const maxSwipe = rowWidthRef.current || 300;
        const minBound = canDelete ? -maxSwipe : 0;
        const maxBound = canArchive ? maxSwipe : 0;
        const current = Math.min(
          maxBound,
          Math.max(minBound, startValueRef.current + gesture.dx)
        );
        if (
          canDelete &&
          (current < -maxSwipe * DISMISS_COMMIT_RATIO ||
            gesture.vx < -DISMISS_COMMIT_VELOCITY)
        ) {
          dismissDelete();
        } else if (
          canArchive &&
          (current > maxSwipe * DISMISS_COMMIT_RATIO || gesture.vx > DISMISS_COMMIT_VELOCITY)
        ) {
          dismissArchive();
        } else if (
          canDelete &&
          (current < -maxSwipe * PEEK_COMMIT_RATIO || gesture.vx < -PEEK_COMMIT_VELOCITY)
        ) {
          peekDelete();
        } else if (
          canArchive &&
          (current > maxSwipe * PEEK_COMMIT_RATIO || gesture.vx > PEEK_COMMIT_VELOCITY)
        ) {
          peekArchive();
        } else {
          closeRow();
        }
      },
      onPanResponderTerminate: closeRow,
    })
  ).current;

  const handleRowPress = () => {
    if (openSideRef.current !== "none") {
      closeRow();
    } else {
      onPress?.();
    }
  };

  // Only one banner is ever meant to be visible at a time — without gating
  // opacity by which side is actually revealed, both banners (each an
  // absolute-fill layer so their corner-rounding lines up with the sliding
  // row's own edge) would sit stacked in the same space and whichever
  // rendered later in JSX would always visually win regardless of swipe
  // direction.
  const archiveOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const deleteOpacity = translateX.interpolate({
    inputRange: [-1, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
    >
      {canArchive && (
        <Animated.View
          pointerEvents={openSide === "archive" ? "box-none" : "none"}
          style={[
            styles.banner,
            {
              opacity: archiveOpacity,
              backgroundColor:
                theme === "dark" ? tokens.containerHigh : tokens.containerMedium,
            },
          ]}
        >
          <TouchableOpacity style={styles.bannerTouchable} onPress={dismissArchive}>
            {archiveContent}
          </TouchableOpacity>
        </Animated.View>
      )}
      {canDelete && (
        <Animated.View
          pointerEvents={openSide === "delete" ? "box-none" : "none"}
          style={[
            styles.banner,
            { opacity: deleteOpacity, backgroundColor: tokens.errorContainer },
          ]}
        >
          <TouchableOpacity style={styles.bannerTouchable} onPress={dismissDelete}>
            {deleteContent}
          </TouchableOpacity>
        </Animated.View>
      )}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.row,
          { backgroundColor: tokens.background, transform: [{ translateX }] },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.rowPressable,
            contentStyle,
            pressed && { backgroundColor: tokens.containerMedium },
          ]}
          onPress={handleRowPress}
        >
          {children}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    width: "100%",
  },
  row: {
    width: "100%",
    // The visible seam during a partial swipe is this row's own trailing
    // edge sliding away, not the banner's bounding-box corner underneath —
    // rounding it here is what makes the reveal itself look rounded rather
    // than the banner only looking rounded once fully open.
    borderRadius: 12,
    overflow: "hidden",
  },
  rowPressable: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    // This padding lives here rather than on the outer row — on the element
    // that actually paints the press highlight — so the highlighted area is
    // bigger than the tight content bounds without changing the row's total
    // height, keeping list spacing the same.
    paddingVertical: 10,
  },
  banner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
});

export default SwipeableRow;
