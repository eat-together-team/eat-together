// Full-screen event photo viewer — reached by tapping a photo in the
// EventGallery grid. Pinch/pan/dismiss reuse the same plain PanResponder +
// Animated approach as Chat's ImageViewer.js (see that file's header
// comment for why: this project's reanimated/worklets combo crashes on any
// code path that touches worklets, so no Gesture Handler Gesture API here
// either). A horizontal drag on the photo itself (only while not zoomed in)
// drags the current photo and its neighbor together like a real filmstrip —
// release past the threshold and it finishes sliding into place, release
// short and it springs back — and a thumbnail strip at the bottom keeps the
// current photo centered, fades its edges only when there's more to scroll
// to, and lets dragging it settle on a new photo too.

import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, PanResponder, Animated, Easing, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import PeopleInPhotoSheet from "../../components/PeopleInPhotoSheet";
import TaggedAvatarStack from "../../components/TaggedAvatarStack";
import Header4Text from "../../components/typography/Header4Text";
import { auth, db, storage } from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import { fetchPeopleByIds } from "../../utils/fetchPeopleByIds";

// Same "trust event.type, default to public" convention FullCard.js's
// delete-event uses — this screen can be reached for both public and
// private events (MyEvents.js routes both types through FullCard, which is
// where the gallery is opened from).
const dbNameForEvent = (event) => (event?.type === "private" ? "Private Events" : "Public Events");

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1.2;
const SWIPE_THRESHOLD = 60;
const SWIPE_DURATION = 220;

const THUMB_SIZE = 42;
const THUMB_ROW_GAP = 5;
// The selected frame is a border that sits detached from the image itself
// (a ring, not an outline hugging the photo) — BORDER_GAP is the breathing
// room between them, BORDER_WIDTH how thick the ring is. Present at every
// thumbnail (transparent when unselected) so the frame's footprint never
// changes between selected/unselected — see the recyclingKey comment below
// for why that matters.
const THUMB_BORDER_GAP = 4;
const THUMB_BORDER_WIDTH = 2;
const THUMB_FRAME_SIZE = THUMB_SIZE + (THUMB_BORDER_GAP + THUMB_BORDER_WIDTH) * 2;
const THUMB_PITCH = THUMB_FRAME_SIZE + THUMB_ROW_GAP;
// Padding either side of the thumbnail strip so the first/last thumbnail
// can still be scrolled all the way to the center of the screen. Rounded to
// a whole pixel so it can't drift out of sync with the (integer) scroll
// offsets computed from THUMB_PITCH below.
const THUMB_SIDE_PAD = Math.round((SCREEN_WIDTH - THUMB_FRAME_SIZE) / 2);
const FADE_WIDTH = 24;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const distanceBetween = (touches) => {
  const [a, b] = touches;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};

export default function EventPhotoViewer({ route, navigation }) {
  const { photos, initialIndex, event } = route.params;
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const insets = useSafeAreaInsets();

  const [index, setIndex] = useState(initialIndex || 0);
  // Local, mutable copy of `photos` so tagging a person can update this
  // photo's `taggedUserIds` in place without needing a live Firestore
  // listener on this screen — `route.params.photos` is only a one-time
  // snapshot from whichever screen navigated here.
  const [photoList, setPhotoList] = useState(photos);
  const photo = photoList[index];
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [peopleSheetVisible, setPeopleSheetVisible] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState([]);
  const isOwnPhoto = photo.userUploaded === auth.currentUser?.uid;
  const taggedUserIds = photo.taggedUserIds || [];

  // The PanResponder below is created once (via the useRef/.current pattern
  // ImageViewer.js also uses) so its callbacks close over stale state —
  // this ref is kept in sync on every render so gesture handlers always see
  // the current photo index.
  const indexRef = useRef(index);
  indexRef.current = index;

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Committed values from the end of the previous gesture.
  const baseScale = useRef(1);
  const baseTranslate = useRef({ x: 0, y: 0 });

  // Re-derived every time the active touch count changes (1 finger <-> 2
  // fingers) rather than only once at gesture start — see ImageViewer.js.
  const touchState = useRef({ mode: "none" });

  // Horizontal filmstrip drag: `dragX` moves the current photo and, once a
  // direction is clear, `previewIndex` mounts the neighbor photo so it
  // slides in from the edge in lockstep with `dragX`.
  const dragX = useRef(new Animated.Value(0)).current;
  const [previewIndex, setPreviewIndex] = useState(null);
  const previewIndexRef = useRef(null);

  const thumbRowRef = useRef(null);
  const didMountThumbRow = useRef(false);
  const thumbScrollX = useRef(new Animated.Value((initialIndex || 0) * THUMB_PITCH)).current;
  const maxThumbScrollX = Math.max(0, (photos.length - 1) * THUMB_PITCH);
  // Set right before an index change that came from the thumbnail strip's
  // own drag settling — the strip is already sitting exactly where it needs
  // to be, so the effect below skips its `scrollTo`. Re-issuing an
  // animated scrollTo to the offset the native ScrollView is already at is
  // what was corrupting its internal layout (collapsing the row to a single
  // visible thumbnail) on both platforms.
  const skipNextThumbScroll = useRef(false);

  // Reset zoom/pan/drag whenever the visible photo changes (swipe or
  // thumbnail drag/tap) and keep the thumbnail strip centered on it.
  useEffect(() => {
    baseScale.current = 1;
    baseTranslate.current = { x: 0, y: 0 };
    scale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    dragX.setValue(0);
    previewIndexRef.current = null;
    setPreviewIndex(null);

    if (skipNextThumbScroll.current) {
      skipNextThumbScroll.current = false;
    } else {
      thumbRowRef.current?.scrollTo({
        x: Math.min(index * THUMB_PITCH, maxThumbScrollX),
        animated: didMountThumbRow.current,
      });
    }
    didMountThumbRow.current = true;
  }, [index]);

  const goTo = (nextIndex) => {
    if (nextIndex >= 0 && nextIndex < photos.length) {
      setIndex(nextIndex);
    }
  };

  // Fires once the thumbnail strip settles after a drag — whichever photo
  // ended up centered becomes the current one. The strip is already
  // sitting at the right offset, so this shouldn't scroll it again.
  const handleThumbScrollSettled = (event) => {
    const nextIndex = clamp(Math.round(event.nativeEvent.contentOffset.x / THUMB_PITCH), 0, photos.length - 1);
    if (nextIndex !== index) {
      skipNextThumbScroll.current = true;
      setIndex(nextIndex);
    }
  };

  const setPreview = (candidate) => {
    if (previewIndexRef.current !== candidate) {
      previewIndexRef.current = candidate;
      setPreviewIndex(candidate);
    }
  };

  const confirmDeletePhoto = async () => {
    setDeleteDialogVisible(false);
    try {
      await storage.ref().child(`eventGallery/${event.id}/${photo.imageId}`).delete();
      await db.collection(dbNameForEvent(event)).doc(event.id).update({
        eventGallery: firebase.firestore.FieldValue.arrayRemove(photo),
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting image: ", error);
    }
  };

  // Refreshes this screen's local photo data (in particular, taggedUserIds)
  // whenever it regains focus — covers coming back from AddTaggedPerson,
  // since that screen writes straight to Firestore and just goes back
  // rather than passing anything through params.
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      db.collection(dbNameForEvent(event)).doc(event.id).get().then((doc) => {
        const gallery = (doc.data() && doc.data().eventGallery) || [];
        setPhotoList((prev) => prev.map((p) => gallery.find((g) => g.imageId === p.imageId) || p));
      });
    });
    return unsubscribe;
  }, [navigation, event]);

  useEffect(() => {
    if (taggedUserIds.length === 0) {
      setTaggedPeople([]);
      return;
    }
    fetchPeopleByIds(taggedUserIds).then(setTaggedPeople);
  }, [taggedUserIds.join(",")]);

  const handleAddPeoplePress = () => {
    setPeopleSheetVisible(false);
    navigation.navigate("AddTaggedPerson", { event, photo });
  };

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
          // Not zoomed in — a single-finger drag either drags the photo
          // horizontally to the next/previous one (following the finger 1:1,
          // like a real filmstrip) or slides it down to dismiss (vertical);
          // whichever axis is currently further wins, and can flip mid-drag.
          const touch = touches[0];
          if (state.mode !== "swipe") {
            touchState.current = { mode: "swipe", startX: touch.pageX, startY: touch.pageY, dx: 0, dy: 0 };
          } else {
            const dx = touch.pageX - state.startX;
            const dy = touch.pageY - state.startY;
            touchState.current = { ...state, dx, dy };

            if (Math.abs(dx) > Math.abs(dy)) {
              translateY.setValue(0);
              dragX.setValue(dx);
              const candidate = indexRef.current + (dx < 0 ? 1 : -1);
              if (candidate >= 0 && candidate < photos.length) {
                setPreview(candidate);
              } else {
                setPreview(null);
              }
            } else {
              dragX.setValue(0);
              translateY.setValue(dy);
              setPreview(null);
            }
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
        } else if (state.mode === "swipe") {
          const horizontalDominant = Math.abs(state.dx) > Math.abs(state.dy);
          const candidate = indexRef.current + (state.dx < 0 ? 1 : -1);
          const canAdvance =
            horizontalDominant &&
            Math.abs(state.dx) > SWIPE_THRESHOLD &&
            candidate >= 0 &&
            candidate < photos.length;

          if (canAdvance) {
            Animated.timing(dragX, {
              toValue: state.dx < 0 ? -SCREEN_WIDTH : SCREEN_WIDTH,
              duration: SWIPE_DURATION,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start(() => setIndex(candidate));
          } else if (!horizontalDominant && (state.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY)) {
            navigation.goBack();
          } else {
            Animated.parallel([
              Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
              Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            ]).start(() => setPreview(null));
          }
        }

        touchState.current = { mode: "none" };
      },
    })
  ).current;

  const leftFadeOpacity = thumbScrollX.interpolate({
    inputRange: [0, FADE_WIDTH],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const rightFadeOpacity = thumbScrollX.interpolate({
    inputRange: [Math.max(0, maxThumbScrollX - FADE_WIDTH), maxThumbScrollX],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const previewPhoto = previewIndex !== null ? photos[previewIndex] : null;
  const previewBaseOffset = previewIndex !== null ? (previewIndex > index ? SCREEN_WIDTH : -SCREEN_WIDTH) : 0;

  const taggedSummaryLabel =
    taggedPeople.length === 1
      ? taggedPeople[0].id === auth.currentUser?.uid
        ? "You"
        : [taggedPeople[0].firstName, taggedPeople[0].lastName].filter(Boolean).join(" ")
      : `${taggedPeople.length} people`;

  return (
    <Layout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={23} color={tokens.onBackground} />
        </TouchableOpacity>
        {isOwnPhoto && (
          <View style={styles.headerActions}>
            <TouchableOpacity hitSlop={8} onPress={() => setPeopleSheetVisible(true)}>
              <Ionicons name="people-outline" size={23} color={tokens.onBackground} />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={8} onPress={() => setDeleteDialogVisible(true)}>
              <Ionicons name="trash-outline" size={23} color={tokens.onBackground} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.body} {...panResponder.panHandlers}>
        {previewPhoto && (
          <Animated.View
            style={[
              styles.imageWrapper,
              styles.previewImageWrapper,
              { transform: [{ translateX: previewBaseOffset }, { translateX: dragX }] },
            ]}
          >
            <Image
              source={{ uri: previewPhoto.imageUrl }}
              style={styles.image}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.imageWrapper,
            { transform: [{ translateX: dragX }, { translateX }, { translateY }, { scale }] },
          ]}
        >
          <Image
            source={{ uri: photo.imageUrl }}
            style={styles.image}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </Animated.View>
      </View>

      {taggedPeople.length > 0 && (
        <TouchableOpacity
          style={styles.taggedSummary}
          onPress={() => setPeopleSheetVisible(true)}
          activeOpacity={0.7}
        >
          <TaggedAvatarStack people={taggedPeople} borderColor={tokens.background} />
          <Header4Text color={tokens.textMedium}>{taggedSummaryLabel}</Header4Text>
        </TouchableOpacity>
      )}

      <View style={[styles.thumbRow, { paddingBottom: insets.bottom + 20 }]}>
          <Animated.ScrollView
            ref={thumbRowRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={THUMB_PITCH}
            decelerationRate="fast"
            contentOffset={{ x: Math.min((initialIndex || 0) * THUMB_PITCH, maxThumbScrollX), y: 0 }}
            contentContainerStyle={[styles.thumbRowContent, { paddingHorizontal: THUMB_SIDE_PAD }]}
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: thumbScrollX } } }], {
              useNativeDriver: true,
            })}
            onMomentumScrollEnd={handleThumbScrollSettled}
          >
            {photos.map((p, i) => (
              <TouchableOpacity
                key={`${p.imageId}-${i}`}
                onPress={() => goTo(i)}
                activeOpacity={0.8}
                style={i < photos.length - 1 ? styles.thumbSpacing : null}
              >
                {/* The selected ring is its own frame around the image (not
                    a border on the image itself) so it reads as detached,
                    the way a photo picker highlights a selection. It's
                    present at every thumbnail, just transparent when
                    unselected, so the frame's size never changes — that
                    plus recyclingKey guards against expo-image occasionally
                    painting blank after the underlying native view got
                    recreated instead of restyled. */}
                <View
                  style={[
                    styles.thumbFrame,
                    { borderColor: i === index ? tokens.onBackground : "transparent" },
                  ]}
                >
                  <Image
                    source={{ uri: p.imageUrl }}
                    recyclingKey={p.imageId}
                    style={[styles.thumb, { opacity: i === index ? 1 : 0.6 }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </Animated.ScrollView>

          <Animated.View style={[styles.edgeFade, styles.edgeFadeLeft, { opacity: leftFadeOpacity }]} pointerEvents="none">
            <LinearGradient
              colors={[tokens.background, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View style={[styles.edgeFade, styles.edgeFadeRight, { opacity: rightFadeOpacity }]} pointerEvents="none">
            <LinearGradient
              colors={["transparent", tokens.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
      </View>

      <DialogOverlay visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
        <Dialog
          type="Destructive"
          title="Remove image?"
          primaryButtonText="Remove"
          secondaryButtonText="Cancel"
          onPrimaryPress={confirmDeletePhoto}
          onSecondaryPress={() => setDeleteDialogVisible(false)}
        >
          <Image source={{ uri: photo.imageUrl }} contentFit="cover" style={styles.deletePreview} />
        </Dialog>
      </DialogOverlay>

      <PeopleInPhotoSheet
        visible={peopleSheetVisible}
        event={event}
        photo={photo}
        canAdd={isOwnPhoto}
        onAddPress={handleAddPeoplePress}
        onDismiss={() => setPeopleSheetVisible(false)}
        onPhotoUpdated={(updatedPhoto) =>
          setPhotoList((prev) => prev.map((p) => (p.imageId === updatedPhoto.imageId ? updatedPhoto : p)))
        }
        navigation={navigation}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  body: {
    flex: 1,
    overflow: "hidden",
  },
  imageWrapper: {
    flex: 1,
    width: "100%",
  },
  previewImageWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  taggedSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 18,
  },
  thumbRow: {
    paddingTop: 12,
  },
  thumbRowContent: {
    alignItems: "center",
  },
  thumbSpacing: {
    marginRight: THUMB_ROW_GAP,
  },
  thumbFrame: {
    width: THUMB_FRAME_SIZE,
    height: THUMB_FRAME_SIZE,
    borderRadius: radiusTokens.medium,
    borderWidth: THUMB_BORDER_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radiusTokens.small,
  },
  edgeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
  },
  edgeFadeLeft: {
    left: 0,
  },
  edgeFadeRight: {
    right: 0,
  },
  deletePreview: {
    width: "100%",
    height: 253,
    borderRadius: radiusTokens.small,
  },
});
