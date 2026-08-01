import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Image } from "expo-image";
import Header3Text from "./typography/Header3Text";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// A single row in a "pick a person" list — avatar + name, tap to act on them.
// `renderRight` renders an optional trailing accessory (e.g. an add button)
// outside the shrinking name/avatar group so it never gets squeezed out.
// Used by NewChat (and anywhere else that needs a plain connections list).
const UserListItem = ({ person, onPress, renderRight }) => {
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
      <View style={styles.left}>
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
      </View>
      {renderRight}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingStart: 3,
    borderRadius: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
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
