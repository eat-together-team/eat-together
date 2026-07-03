import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useFonts, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { storage } from "../provider/Firebase";
import moment from "moment";

const DEFAULT_AVATAR =
  "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png";

const ChatPreview = (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [image, setImage] = useState(DEFAULT_AVATAR);
  // Figma's "Header 3" style (13px Semi Bold) and the unread "Sub body" variant
  // (12px Bold) aren't in the typography/ set, so load the extra weights here.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (props.group.hasImage) {
      storage
        .ref("profilePictures/" + props.group.pictureID)
        .getDownloadURL()
        .then((uri) => {
          setImage(uri);
        });
    }
  }, []);

  const time =
    props.group.time !== "" ? moment.unix(props.group.time).fromNow(true) : "";

  return (
    <TouchableOpacity style={styles.row} onPress={props.onPress}>
      <Image source={{ uri: image }} style={styles.avatar} />
      <View style={styles.content}>
        <Header4Text
          color={tokens.textNormal}
          style={fontsLoaded ? { fontFamily: "Inter_600SemiBold" } : undefined}
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
