import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import Header3Text from "./typography/Header3Text";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// A single row in a "pick a person" list — avatar + name, tap to act on them.
// Used by NewChat (and anywhere else that needs a plain connections list).
const UserListItem = ({ person, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: tokens.containerMedium },
      ]}
      onPress={() => onPress?.(person)}
    >
      <Image
        source={person.image ? { uri: person.image } : undefined}
        placeholder={avatarPlaceholder}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        style={styles.avatar}
      />
      <Header3Text
        color={tokens.onBackground}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.name}
      >
        {person.name}
      </Header3Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 16,
    paddingStart: 3,
    borderRadius: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  name: {
    flexShrink: 1,
  },
});

export default UserListItem;
