import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import TaggedAvatarStack from "./TaggedAvatarStack";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";

const screenWidth = Dimensions.get("window").width;
const GRID_GAP = 14;
const GRID_PADDING = 20;
export const CARD_SIZE = (screenWidth - GRID_PADDING * 2 - GRID_GAP) / 2;

// Grid card for the Event photos gallery page. `onDelete` is only passed for
// photos the current user uploaded (the design's own-photo trash
// affordance). `onPress` opens the photo full-size in EventPhotoViewer.
const EventPhotoCard = ({ photo, taggedPeople = [], onPress, onDelete }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: photo.imageUrl }} contentFit="cover" style={styles.image} />
      {taggedPeople.length > 0 && (
        <View style={styles.taggedOverlay} pointerEvents="none">
          <TaggedAvatarStack people={taggedPeople} size={23} borderColor="#fff" />
        </View>
      )}
      {onDelete && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: tokens.background }]}
          onPress={onDelete}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color={tokens.onBackground} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radiusTokens.small,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  taggedOverlay: {
    position: "absolute",
    left: 10,
    bottom: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: radiusTokens.small,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default React.memo(EventPhotoCard);
