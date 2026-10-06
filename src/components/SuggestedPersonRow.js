import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import Tag from "./Tag";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";
import { storage } from "../provider/Firebase";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// Matches the profile page's tag row edge-to-edge — same fade-on-scroll
// technique as EventPhotoViewer.js's thumbnail strip, just at a smaller
// scale for this compact chip row.
const FADE_WIDTH = 20;

// Row used for both the Explore feed's "People" preview and the full People
// list — avatar, name, bio, and up to 2 tags. Memoized since the People
// list can render many of these at once — without it, unrelated screen
// state changes (typing, focus, filters) force every visible row to
// re-render on every scroll frame.
const SuggestedPersonRow = ({ person, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  // Figma's "Header 3" style (13px Semi Bold) isn't in the typography/ set —
  // same approach as ChatPreview.js: load the extra weight and override
  // Header4Text's style inline.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  const tagsScrollX = useRef(new Animated.Value(0)).current;
  const [tagsContainerWidth, setTagsContainerWidth] = useState(0);
  const [tagsContentWidth, setTagsContentWidth] = useState(0);
  const maxTagsScrollX = Math.max(0, tagsContentWidth - tagsContainerWidth);
  const canScrollTags = maxTagsScrollX > 0;

  useEffect(() => {
    if (person.hasImage) {
      storage
        .ref("profilePictures/" + person.id)
        .getDownloadURL()
        .then(setImageUri);
    }
  }, [person.hasImage, person.id]);

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const previewTags = (person.tags || []).slice(0, 2);

  const leftFadeOpacity = tagsScrollX.interpolate({
    inputRange: [0, FADE_WIDTH],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const rightFadeOpacity = tagsScrollX.interpolate({
    inputRange: [Math.max(0, maxTagsScrollX - FADE_WIDTH), Math.max(maxTagsScrollX, 1)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(person)} activeOpacity={0.85}>
      <Image
        source={imageUri ? { uri: imageUri } : undefined}
        placeholder={avatarPlaceholder}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Header4Text
          color={tokens.onBackground}
          numberOfLines={1}
          style={fontsLoaded ? { fontFamily: "Inter_600SemiBold", fontSize: 13 } : { fontSize: 13 }}
        >
          {person.firstName} {person.lastName}
        </Header4Text>
        <SubBodyText color={tokens.onBackground} numberOfLines={1}>
          "{person.bio}"
        </SubBodyText>
        {previewTags.length > 0 && (
          <View style={styles.tagsWrap}>
            {/* Horizontal scroll rather than flexWrap — keeps the row to a
            single line even when both chips together don't fit, instead of
            wrapping onto a second row (same approach as ProfileBubble.js). */}
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tags}
              onLayout={(e) => setTagsContainerWidth(e.nativeEvent.layout.width)}
              onContentSizeChange={(width) => setTagsContentWidth(width)}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: tagsScrollX } } }],
                { useNativeDriver: true }
              )}
            >
              {previewTags.map((tag, index) => (
                <Tag key={index} type={tag.type} text={tag.tag} />
              ))}
            </Animated.ScrollView>

            {canScrollTags && (
              <>
                <Animated.View
                  style={[styles.edgeFade, styles.edgeFadeLeft, { opacity: leftFadeOpacity }]}
                  pointerEvents="none"
                >
                  <LinearGradient
                    colors={[tokens.background, "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                <Animated.View
                  style={[styles.edgeFade, styles.edgeFadeRight, { opacity: rightFadeOpacity }]}
                  pointerEvents="none"
                >
                  <LinearGradient
                    colors={["transparent", tokens.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  tagsWrap: {
    position: "relative",
  },
  tags: {
    flexDirection: "row",
    gap: 5,
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
});

export default React.memo(SuggestedPersonRow);
