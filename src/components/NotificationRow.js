import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import OutlinePillButton from "./OutlinePillButton";
import SwipeableRow from "./SwipeableRow";
import formatRelativeTime from "../utils/formatRelativeTime";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// One row in the notifications list — Figma's "Large User List Item". Three
// looks, all the same height (83pt) so nothing shifts as a row changes state:
//
//   action    avatar + text + time + an Accept pill (friend/message requests)
//   thumbnail avatar + text + inline time + a 57x58 event photo (invites, recs)
//   confirmed a full-width green card, after Accept is tapped
//
// `confirmation` (a string) switches the row to the confirmed look. The list
// holds that state briefly before the row disappears — see useNotificationFeed.
const NotificationRow = ({
  name,
  body,
  timestamp,
  avatarUri,
  thumbnail,
  action,
  confirmation,
  onPress,
  onDismiss,
  dismissLabel,
}) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  // Figma's "Header 3" style (13px Semi Bold) isn't in the typography/ set —
  // same approach as ChatPreview.js and SuggestedPersonRow.js: load the extra
  // weight and override Header4Text's style inline.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const time = formatRelativeTime(timestamp);
  // `thumbnail` is either a remote url or an already-required local asset
  // (the stock event photo, for an event with no picture of its own).
  const thumbnailSource = typeof thumbnail === "string" ? { uri: thumbnail } : thumbnail;

  if (confirmation) {
    return (
      <View style={styles.confirmationSlot}>
        <View style={[styles.confirmation, { backgroundColor: tokens.primary }]}>
          <Ionicons name="checkmark" size={16} color={tokens.background} />
          <Header4Text color={tokens.background} center>
            {confirmation}
          </Header4Text>
        </View>
      </View>
    );
  }

  const nameStyle = fontsLoaded
    ? { fontFamily: "Inter_600SemiBold", fontSize: 13 }
    : { fontSize: 13 };

  return (
    <SwipeableRow
      onPress={onPress}
      onDelete={onDismiss}
      contentStyle={styles.rowContent}
      deleteContent={
        <>
          {/* Delete is revealed from the right edge inward, so the icon
              (closest to that edge) should show up first. */}
          <Header4Text color={tokens.error}>{dismissLabel}</Header4Text>
          <Ionicons name="trash" size={25} color={tokens.error} />
        </>
      }
    >
      <Image
        source={avatarUri ? { uri: avatarUri } : undefined}
        placeholder={avatarPlaceholder}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <Header4Text color={tokens.textNormal} numberOfLines={1} style={nameStyle}>
          {name}
        </Header4Text>
        <View style={styles.bodyRow}>
          <SubBodyText color={tokens.textNormal} numberOfLines={2} style={styles.body}>
            {body}
          </SubBodyText>
          {/* The thumbnail variant tucks the time in beside the body text
              rather than in its own trailing column, since the photo already
              occupies that slot. */}
          {thumbnailSource && time !== "" && (
            <SubBodyText color={tokens.textMedium}>{time}</SubBodyText>
          )}
        </View>
      </View>

      {thumbnailSource ? (
        <Image
          source={thumbnailSource}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.trailing}>
          {time !== "" && <SubBodyText color={tokens.textMedium}>{time}</SubBodyText>}
          {action && (
            // A sibling touchable inside the row's own Pressable hit area —
            // RN's responder system gives it its own tap independent of the
            // row's onPress, no propagation-stopping needed.
            <OutlinePillButton
              label={action.label}
              onPress={action.onPress}
              color={tokens.primary}
              disabled={action.disabled}
            />
          )}
        </View>
      )}
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  rowContent: {
    gap: 18,
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  body: {
    flexShrink: 1,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  thumbnail: {
    width: 57,
    height: 58,
    borderRadius: 12,
  },
  // Matches the 63pt avatar + 10pt padding of a normal row, so swapping in
  // the confirmation doesn't move anything below it.
  confirmationSlot: {
    paddingVertical: 10,
  },
  confirmation: {
    height: 63,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
});

export default React.memo(NotificationRow);
