import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Header4Text from "./typography/Header4Text";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";
import { storage } from "../provider/Firebase";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const MAX_VISIBLE = 3;

const AttendeeAvatar = ({ userId, isFirst }) => {
  const { theme } = useTheme();
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    storage
      .ref("profilePictures/" + userId)
      .getDownloadURL()
      .then(setImageUri)
      .catch(() => {});
  }, [userId]);

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  return (
    <Image
      source={imageUri ? { uri: imageUri } : undefined}
      placeholder={avatarPlaceholder}
      placeholderContentFit="cover"
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
      style={[styles.avatar, !isFirst && styles.overlap]}
    />
  );
};

// Overlapping attendee avatar circles (max 3) + "+N others" — used by both
// EventListingCard (real `attendees`) and RecommendationEventCard
// (`suggestedAttendees`), so it just takes a flat array of UIDs.
const AttendeeAvatarStack = ({ attendeeIds = [], textColor }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const visible = attendeeIds.slice(0, MAX_VISIBLE);
  const remaining = attendeeIds.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <View style={styles.row}>
      <View style={styles.stack}>
        {visible.map((userId, index) => (
          <AttendeeAvatar key={userId} userId={userId} isFirst={index === 0} />
        ))}
      </View>
      {remaining > 0 && (
        <Header4Text color={textColor ?? tokens.textMedium}>+ {remaining} others</Header4Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stack: {
    flexDirection: "row",
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  overlap: {
    marginLeft: -9,
  },
});

export default React.memo(AttendeeAvatarStack);
