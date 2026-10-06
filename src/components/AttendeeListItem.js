import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import SubBodyText from "./typography/SubBodyText";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";
import { storage } from "../provider/Firebase";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// Pill-shaped "avatar + name" row used by the Event view's Attending list —
// lighter weight than SmallUserListItem (smaller avatar, no chevron, sits
// on its own container-medium background instead of the page background).
const AttendeeListItem = ({ person, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (person.hasImage) {
      storage
        .ref("profilePictures/" + person.id)
        .getDownloadURL()
        .then(setImageUri)
        .catch(() => {});
    }
  }, [person.hasImage, person.id]);

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(" ");

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: tokens.containerMedium }]}
      onPress={() => onPress?.(person)}
      activeOpacity={0.7}
    >
      <Image
        source={imageUri ? { uri: imageUri } : undefined}
        placeholder={avatarPlaceholder}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        style={styles.avatar}
      />
      <SubBodyText color={tokens.onContainerMedium} style={styles.name} numberOfLines={1}>
        {fullName}
      </SubBodyText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    height: 47,
    width: "100%",
    paddingHorizontal: 9,
    borderRadius: radiusTokens.small,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  name: {
    flexShrink: 1,
    opacity: 0.7,
  },
});

export default React.memo(AttendeeListItem);
