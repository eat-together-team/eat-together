import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import firebase from "firebase/compat";
import moment from "moment";
import getDate from "../utils/getDate";
import getTime from "../utils/getTime";
import SubBodyText from "./typography/SubBodyText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const ChatBubble = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const user = firebase.auth().currentUser;
  const isMine = props.sentBy === user.uid;
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  const openImageViewer = () => {
    props.navigation?.navigate("ImageViewer", { uri: props.url });
  };

  const messageDate = moment.unix(props.sentAt).toDate();
  const nextMessageDate = props.nextMessage
    ? moment.unix(props.nextMessage.sentAt).toDate()
    : "";
  const prevMessageDate = props.prevMessage
    ? moment.unix(props.prevMessage.sentAt).toDate()
    : "";

  const showDayDivider =
    !props.prevMessage ||
    prevMessageDate === "" ||
    getDate(messageDate) !== getDate(prevMessageDate);

  // Consecutive messages from the same sender within 10 minutes of each
  // other are treated as one "burst" — only the last one in that burst shows
  // a timestamp, rather than every message getting its own.
  const TEN_MINUTES_IN_SECONDS = 10 * 60;
  const showTimestamp =
    !props.nextMessage ||
    props.nextMessage.sentBy !== props.sentBy ||
    props.nextMessage.sentAt - props.sentAt > TEN_MINUTES_IN_SECONDS;

  // In a group chat, other people's messages get a name (once, at the top
  // of a burst) and an avatar (once, next to the last bubble of a burst) —
  // your own messages never do, group chat or not, same as it's always
  // been. 1-on-1 chats never show either regardless of sender.
  const showSenderInfo = props.isGroupChat && !isMine;
  const showSenderName =
    showSenderInfo &&
    (!props.prevMessage ||
      props.prevMessage.sentBy !== props.sentBy ||
      props.sentAt - props.prevMessage.sentAt > TEN_MINUTES_IN_SECONDS);
  const showAvatar = showSenderInfo && showTimestamp;
  const senderFirstName = props.sentName ? props.sentName.split(" ")[0] : "";

  const bubbleContent = (
    <>
      {props.url && !props.message ? (
        // Image with no caption — shown on its own, with no bubble
        // background/padding around it.
        <TouchableOpacity onPress={openImageViewer}>
          <Image
            source={{ uri: props.url }}
            style={styles.standaloneImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      ) : props.url ? (
        // Image with a caption — one bubble, image flush against the top
        // (clipped to the bubble's own rounded corners via overflow:
        // hidden), caption padded below it inside the same background.
        <View
          style={[
            styles.mediaBubble,
            { backgroundColor: isMine ? tokens.primaryContainerLow : tokens.containerMedium },
          ]}
        >
          <TouchableOpacity onPress={openImageViewer}>
            <Image
              source={{ uri: props.url }}
              style={styles.mediaImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
          <SubBodyText color={tokens.onBackground} style={styles.mediaCaption}>
            {props.message}
          </SubBodyText>
        </View>
      ) : (
        <View
          style={[
            styles.bubble,
            { backgroundColor: isMine ? tokens.primaryContainerLow : tokens.containerMedium },
          ]}
        >
          <SubBodyText color={tokens.onBackground} style={styles.messageText}>
            {props.message}
          </SubBodyText>
        </View>
      )}
      {showTimestamp && (
        <SubBodyText color={tokens.textMedium} style={styles.timestamp}>
          {getTime(messageDate)}
        </SubBodyText>
      )}
    </>
  );

  return (
    <View>
      {showDayDivider && (
        <SubBodyText color={tokens.textMedium} center style={styles.dayDivider}>
          {getDate(messageDate, false) === getDate(new Date(), false)
            ? "Today"
            : getDate(messageDate, false)}
        </SubBodyText>
      )}

      {showSenderInfo ? (
        <View style={styles.groupRow}>
          <View style={styles.avatarSlot}>
            {showAvatar && (
              <Image
                source={props.senderImage ? { uri: props.senderImage } : undefined}
                placeholder={avatarPlaceholder}
                placeholderContentFit="cover"
                contentFit="cover"
                cachePolicy="memory-disk"
                style={styles.senderAvatar}
              />
            )}
          </View>
          <View style={styles.groupBubbleColumn}>
            {showSenderName && (
              <SubBodyText color={tokens.textMedium} style={styles.senderName}>
                {senderFirstName}
              </SubBodyText>
            )}
            {bubbleContent}
          </View>
        </View>
      ) : (
        <View style={[styles.column, { alignItems: isMine ? "flex-end" : "flex-start" }]}>
          {bubbleContent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dayDivider: {
    textAlign: "center",
    marginVertical: 10,
  },
  column: {
    marginHorizontal: 20,
    marginVertical: 4,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginStart: 20,
    marginEnd: 20,
    marginVertical: 4,
    gap: 8,
  },
  avatarSlot: {
    width: 28,
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  groupBubbleColumn: {
    alignItems: "flex-start",
    flexShrink: 1,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    marginStart: 2,
  },
  bubble: {
    borderRadius: radiusTokens.small,
    paddingHorizontal: 15,
    paddingVertical: 11,
    maxWidth: 276,
  },
  messageText: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  standaloneImage: {
    width: 276,
    height: 220,
    borderRadius: radiusTokens.small,
  },
  mediaBubble: {
    maxWidth: 276,
    borderRadius: radiusTokens.small,
    padding: 10,
    gap: 10,
  },
  mediaImage: {
    width: 256,
    height: 220,
    borderRadius: radiusTokens.small,
  },
  mediaCaption: {
    fontSize: 12,
  },
});

export default ChatBubble;
