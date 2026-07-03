import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useFonts, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { storage } from "../provider/Firebase";
import moment from "moment";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const ChatPreview = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  // Figma's "Header 3" style (13px Semi Bold) and the unread "Sub body" variant
  // (12px Bold) aren't in the typography/ set, so load the extra weights here.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

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
  }, [props.group.avatarUri]);

  const time =
    props.group.time !== "" ? moment.unix(props.group.time).fromNow(true) : "";

  const avatarPlaceholder =
    theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;

  return (
    <TouchableOpacity style={styles.row} onPress={props.onPress}>
      <Image
        source={imageUri ? { uri: imageUri } : avatarPlaceholder}
        style={styles.avatar}
      />
      <View style={styles.content}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 10,
    width: "100%",
  },
  avatar: {
    width: 63,
    height: 63,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ChatPreview;
