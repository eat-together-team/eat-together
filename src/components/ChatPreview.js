import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Alert } from "react-native";
import { Image } from "expo-image";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { storage } from "../provider/Firebase";
import moment from "moment";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const PILL_WIDTH = 76;
// How far past the pill's resting width you need to drag before the action
// area morphs into the full "Delete chat" banner (still just a visual cue
// during the drag — release always settles back at the pill).
const BANNER_DRAG_DISTANCE = 90;

const ChatPreview = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  const [rowWidth, setRowWidth] = useState(0);
  // Figma's "Header 3" style (13px Semi Bold) and the unread "Sub body" variant
  // (12px Bold) aren't in the typography/ set, so load the extra weights here.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

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
  }, [props.group.avatarUri]);

  const time =
    props.group.time !== "" ? moment.unix(props.group.time).fromNow(true) : "";

  const avatarPlaceholder =
    theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  const confirmDelete = () => {
    Alert.alert(
      "Delete Chat",
      `Delete your conversation with ${props.group.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => props.onDelete?.(),
        },
      ]
    );
  };

  const renderRightActions = (progress, dragX) => {
    const bannerOpacity = dragX.interpolate({
      inputRange: [-(PILL_WIDTH + BANNER_DRAG_DISTANCE), -(PILL_WIDTH + 20)],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });
    const pillOpacity = dragX.interpolate({
      inputRange: [-(PILL_WIDTH + BANNER_DRAG_DISTANCE), -(PILL_WIDTH + 20)],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });
    const bannerWidth = dragX.interpolate({
      inputRange: [-(rowWidth || PILL_WIDTH + BANNER_DRAG_DISTANCE), 0],
      outputRange: [rowWidth || PILL_WIDTH + BANNER_DRAG_DISTANCE, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.actions}>
        <Animated.View
          style={[
            styles.deleteBanner,
            { width: bannerWidth, opacity: bannerOpacity, backgroundColor: tokens.errorContainer },
          ]}
        >
          <TouchableOpacity style={styles.bannerTouchable} onPress={confirmDelete}>
            <SubBodyText color={tokens.error} style={{ fontSize: 15 }}>
              Delete chat
            </SubBodyText>
            <Ionicons name="trash-outline" size={20} color={tokens.error} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          style={[
            styles.deletePill,
            { opacity: pillOpacity, backgroundColor: tokens.errorContainer },
          ]}
        >
          <TouchableOpacity style={styles.pillTouchable} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={20} color={tokens.error} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={PILL_WIDTH / 2}
      friction={2}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={props.onPress}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        {/* expo-image caches to disk/memory by uri, so returning to this list
            (e.g. backing out of a chat) doesn't re-fetch the photo, and the
            placeholder shows until the cached/fetched photo is ready. */}
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
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
    width: "100%",
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    width: PILL_WIDTH,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  deleteBanner: {
    position: "absolute",
    right: 0,
    height: "100%",
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
  deletePill: {
    width: PILL_WIDTH - 12,
    height: PILL_WIDTH - 12,
    borderRadius: 16,
    marginRight: 12,
  },
  pillTouchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatPreview;
