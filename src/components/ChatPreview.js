import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import OutlinePillButton from "./OutlinePillButton";
import GroupAvatarPlaceholder from "./GroupAvatarPlaceholder";
import EventChip from "./EventChip";
import SwipeableRow from "./SwipeableRow";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { storage } from "../provider/Firebase";
import moment from "moment";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// The swipe-to-delete/archive gesture itself lives in SwipeableRow.js (shared
// with the notifications list); this file supplies the row content and each
// banner's own label/icon, which is how chats keeps its existing banner
// typography while notifications uses the newer 13px design-system styling.

const ChatPreview = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  // Figma's "Header 3" style (13px Semi Bold) and the unread "Sub body" variant
  // (12px Bold) aren't in the typography/ set, so load the extra weights here.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  const isGroupChat = props.group.uids?.length > 2;

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
  }, [props.group.avatarUri, props.group.hasImage, props.group.pictureID]);

  const time =
    props.group.time !== "" ? moment.unix(props.group.time).fromNow(true) : "";

  const avatarPlaceholder =
    theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  return (
    <SwipeableRow
      onPress={props.onPress}
      onDelete={props.onDelete}
      contentStyle={styles.rowContent}
      deleteContent={
        <>
          {/* Delete is revealed from the right edge inward, so the icon
              (closest to that edge) should show up first. Swiping a group
              chat only ever removes you from it (everyone else's copy is
              untouched), same as "Leave group" in GroupSettings.js — so it's
              labeled that way here too, rather than "Delete chat". */}
          <SubBodyText color={tokens.error} style={{ fontSize: 15 }}>
            {props.deleteLabel || (isGroupChat ? "Leave group" : "Delete chat")}
          </SubBodyText>
          <Ionicons name={isGroupChat ? "log-out" : "trash"} size={20} color={tokens.error} />
        </>
      }
      onArchive={props.archiveAction?.onPress}
      archiveContent={
        props.archiveAction ? (
          <>
            {/* Archive is revealed from the left edge inward, so the icon
                (closest to that edge) should show up first. */}
            <Ionicons
              name={props.archiveAction.icon || "archive"}
              size={20}
              color={tokens.onBackground}
            />
            <SubBodyText color={tokens.onBackground} style={{ fontSize: 15 }}>
              {props.archiveAction.label}
            </SubBodyText>
          </>
        ) : null
      }
    >
      {!imageUri && props.group.uids?.length > 2 ? (
        // Group chat with no custom photo set — the illustrated default
        // rather than the single-person silhouette placeholder below,
        // which is meant for 1-on-1s.
        <GroupAvatarPlaceholder size={63} />
      ) : (
        // expo-image caches to disk/memory by uri, so returning to this
        // list (e.g. backing out of a chat) doesn't re-fetch the photo,
        // and the placeholder shows until the cached/fetched photo is
        // ready.
        <Image
          source={imageUri ? { uri: imageUri } : undefined}
          placeholder={avatarPlaceholder}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          style={styles.avatar}
        />
      )}
      <View style={styles.content}>
        {props.group.eventID && <EventChip />}
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

      {props.trailingButton && (
        // A sibling touchable inside the same Pressable's hit area —
        // RN's responder system gives it its own tap independent of the
        // row's own onPress, no propagation-stopping needed.
        <OutlinePillButton
          label={props.trailingButton.label}
          onPress={props.trailingButton.onPress}
          color={tokens.outline}
        />
      )}
    </SwipeableRow>
  );
};

const styles = StyleSheet.create({
  rowContent: {
    gap: 18,
    // Only the end (right) side gets the extra breathing room — the start
    // (left) side stays flush so the avatar's edge lines up with the
    // Searchbar/"Messages" text above it, which have no such inset.
    paddingStart: 0,
    paddingEnd: 8,
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
    paddingRight: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ChatPreview;
