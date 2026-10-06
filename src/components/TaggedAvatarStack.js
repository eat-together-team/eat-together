import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { storage } from "../provider/Firebase";
import { useTheme } from "../rapi_ui_components";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// A single stacked avatar that resolves its own image URL, same pattern as
// AttendeeListItem/SmallUserListItem.
const StackedAvatar = ({ person, size, overlap, placeholderSrc, borderColor }) => {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    if (person.hasImage) {
      storage.ref("profilePictures/" + person.id).getDownloadURL().then(setImageUri).catch(() => {});
    }
  }, [person.hasImage, person.id]);

  return (
    <Image
      source={imageUri ? { uri: imageUri } : undefined}
      placeholder={placeholderSrc}
      placeholderContentFit="cover"
      contentFit="cover"
      cachePolicy="memory-disk"
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, borderColor, marginLeft: overlap },
      ]}
    />
  );
};

// Up to 3 overlapping circular avatars for "who's tagged" summaries — used
// both under a photo's main view and as a small overlay on gallery grid
// thumbnails. `people` should already be resolved Users-doc data
// ({ id, hasImage }), most-relevant-first (only the first 3 render).
const TaggedAvatarStack = ({ people, size = 23, borderColor = "#fff" }) => {
  const { theme } = useTheme();
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const visible = people.slice(0, 3);

  return (
    <View style={styles.row}>
      {visible.map((person, index) => (
        <StackedAvatar
          key={person.id}
          person={person}
          size={size}
          overlap={index === 0 ? 0 : -size * 0.4}
          borderColor={borderColor}
          placeholderSrc={avatarPlaceholder}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 1,
  },
});

export default TaggedAvatarStack;
