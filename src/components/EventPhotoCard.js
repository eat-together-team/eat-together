import React from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";

const screenWidth = Dimensions.get("window").width;
const GRID_GAP = 14;
const GRID_PADDING = 20;
export const CARD_SIZE = (screenWidth - GRID_PADDING * 2 - GRID_GAP) / 2;

// Grid card for the Event photos gallery page. `onDelete` is only passed for
// photos the current user uploaded (the design's own-photo trash
// affordance) — tapping a card to view the photo full-size isn't wired up
// yet.
const EventPhotoCard = ({ photo, onDelete }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <View style={styles.card}>
      <Image source={{ uri: photo.imageUrl }} contentFit="cover" style={styles.image} />
      {onDelete && (
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: tokens.background }]}
          onPress={onDelete}
          hitSlop={8}
        >
          <Ionicons name="trash-outline" size={16} color={tokens.onBackground} />
        </TouchableOpacity>
      )}
    </View>
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
