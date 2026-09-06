import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import OutlinePillButton from "./OutlinePillButton";
import GroupAvatarPlaceholder from "./GroupAvatarPlaceholder";
import EventChip from "./EventChip";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { storage } from "../provider/Firebase";
import moment from "moment";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// Swipe-to-delete/archive is built on plain PanResponder rather than
// react-native-gesture-handler's Swipeable, after hitting real bugs with
// both the classic (Animated-API) version (didn't track the gesture
// smoothly under the New Architecture) and ReanimatedSwipeable (crashed:
// "[Worklets] Tried to synchronously call a non-worklet function
// addListener on the UI thread"). PanResponder is core React Native with no
// Reanimated/worklets involvement at all.
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

const ChatPreview = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  const [rowWidth, setRowWidth] = useState(0);
  // Figma's "Header 3" style (13px Semi Bold) and the unread "Sub body" variant
  // (12px Bold) aren't in the typography/ set, so load the extra weights here.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

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
  const canArchive = !!props.archiveAction;
  const isGroupChat = props.group.uids?.length > 2;

  useEffect(() => {
    rowWidthRef.current = rowWidth;
  }, [rowWidth]);

  useEffect(() => {
    if (props.group.avatarUri) {
      // 1-on-1 chat: the other person's own profile photo, resolved in Chats.js
      setImageUri(props.group.avatarUri);
    } else if (props.group.hasImage) {
      // group chat: fall back to a dedicated group photo, if one was ever set
      storage
        .ref("profilePictures/" + props.group.pictureID)
        .getDownloadURL()
        .then((uri) => {
          setImageUri(uri);
        });
    }
  }, [props.group.avatarUri, props.group.hasImage, props.group.pictureID]);

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
      if (finished) props.archiveAction?.onPress();
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
      if (finished) props.onDelete?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderGrant: () => {
        translateX.stopAnimation((value) => {
          startValueRef.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const maxSwipe = rowWidthRef.current || 300;
        const minBound = -maxSwipe;
        const maxBound = canArchive ? maxSwipe : 0;
        const next = Math.min(
          maxBound,
          Math.max(minBound, startValueRef.current + gesture.dx)
        );
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const maxSwipe = rowWidthRef.current || 300;
        const minBound = -maxSwipe;
        const maxBound = canArchive ? maxSwipe : 0;
        const current = Math.min(
          maxBound,
          Math.max(minBound, startValueRef.current + gesture.dx)
        );
        if (
          current < -maxSwipe * DISMISS_COMMIT_RATIO ||
          gesture.vx < -DISMISS_COMMIT_VELOCITY
        ) {
          dismissDelete();
        } else if (
          canArchive &&
          (current > maxSwipe * DISMISS_COMMIT_RATIO || gesture.vx > DISMISS_COMMIT_VELOCITY)
        ) {
          dismissArchive();
        } else if (
          current < -maxSwipe * PEEK_COMMIT_RATIO ||
          gesture.vx < -PEEK_COMMIT_VELOCITY
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

  const time =
    props.group.time !== "" ? moment.unix(props.group.time).fromNow(true) : "";

  const avatarPlaceholder =
    theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  const handleRowPress = () => {
    if (openSideRef.current !== "none") {
      closeRow();
    } else {
      props.onPress?.();
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
            styles.archiveBanner,
            {
              opacity: archiveOpacity,
              backgroundColor:
                theme === "dark" ? tokens.containerHigh : tokens.containerMedium,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.bannerTouchable}
            onPress={dismissArchive}
          >
            {/* Archive is revealed from the left edge inward, so the icon
                (closest to that edge) should show up first. */}
            <Ionicons
              name={props.archiveAction.icon || "archive"}
              size={20}
              color={tokens.onBackground}
            />
            <SubBodyText color={tokens.onBackground} style={{ fontSize: 15 }}>
              {props.archiveAction.label}
            </SubBodyText>
          </TouchableOpacity>
        </Animated.View>
      )}
      <Animated.View
        pointerEvents={openSide === "delete" ? "box-none" : "none"}
        style={[
          styles.deleteBanner,
          { opacity: deleteOpacity, backgroundColor: tokens.errorContainer },
        ]}
      >
        <TouchableOpacity style={styles.bannerTouchable} onPress={dismissDelete}>
          {/* Delete is revealed from the right edge inward, so the icon
              (closest to that edge) should show up first. Swiping a group
              chat only ever removes you from it (everyone else's copy is
              untouched), same as "Leave group" in GroupSettings.js — so it's
              labeled that way here too, rather than "Delete chat". */}
          <SubBodyText color={tokens.error} style={{ fontSize: 15 }}>
            {props.deleteLabel || (isGroupChat ? "Leave group" : "Delete chat")}
          </SubBodyText>
          <Ionicons name={isGroupChat ? "log-out" : "trash"} size={20} color={tokens.error} />
        </TouchableOpacity>
      </Animated.View>
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
            pressed && { backgroundColor: tokens.containerMedium },
          ]}
          onPress={handleRowPress}
        >
          {!imageUri && props.group.uids?.length > 2 ? (
            // Group chat with no custom photo set — the illustrated default
            // rather than the single-person silhouette placeholder below,
            // which is meant for 1-on-1s.
            <GroupAvatarPlaceholder size={63} />
          ) : (
            // expo-image caches to disk/memory by uri, so returning to this
            // list (e.g. backing out of a chat) doesn't re-fetch the photo,
            // and the placeholder shows until the cached/fetched photo is
            // ready.
            <Image
              source={imageUri ? { uri: imageUri } : undefined}
              placeholder={avatarPlaceholder}
              placeholderContentFit="cover"
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              style={styles.avatar}
            />
          )}
          <View style={styles.content}>
            {props.group.eventID && <EventChip />}
            <Header4Text
              color={tokens.textNormal}
              style={
                fontsLoaded
                  ? { fontFamily: "Inter_600SemiBold", fontSize: 15 }
                  : { fontSize: 15 }
              }
            >
              {props.group.name}
            </Header4Text>
            <View style={styles.messageRow}>
              {props.group.message !== "" && (
                <SubBodyText
                  color={tokens.textNormal}
                  numberOfLines={1}
                  style={[
                    { flexShrink: 1 },
                    props.group.unread && fontsLoaded
                      ? { fontFamily: "Inter_700Bold" }
                      : null,
                  ]}
                >
                  {props.group.message}
                </SubBodyText>
              )}
              {time !== "" && (
                <SubBodyText color={tokens.textMedium}> · {time}</SubBodyText>
              )}
            </View>
          </View>

          {props.trailingButton && (
            // A sibling touchable inside the same Pressable's hit area —
            // RN's responder system gives it its own tap independent of the
            // row's own onPress, no propagation-stopping needed.
            <OutlinePillButton
              label={props.trailingButton.label}
              onPress={props.trailingButton.onPress}
              color={tokens.outline}
            />
          )}
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
    gap: 18,
    borderRadius: 12,
    // This padding used to live on the outer row instead — moving it here
    // (onto the element that actually paints the press highlight) makes the
    // highlighted area bigger than the tight content bounds without
    // changing the row's total height, so spacing between chat items in the
    // list stays the same.
    paddingVertical: 10,
    // Only the end (right) side gets the extra breathing room — the start
    // (left) side stays flush so the avatar's edge lines up with the
    // Searchbar/"Messages" text above it, which have no such inset.
    paddingStart: 0,
    paddingEnd: 8,
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteBanner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: "hidden",
  },
  archiveBanner: {
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

export default ChatPreview;
