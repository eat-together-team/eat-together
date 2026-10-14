import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";
import { storage } from "../provider/Firebase";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

// Compact "avatar + name + chevron" row used for search results — lighter
// weight than SuggestedPersonRow (no bio/tags), just enough to identify and
// tap through to a person's profile. Memoized for the same reason as
// SuggestedPersonRow — keeps scrolling smooth over many rows.
const SmallUserListItem = ({ person, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  // Figma's "Header 3" style (13px Semi Bold) isn't in the typography/ set —
  // same approach as ChatPreview.js/SuggestedPersonRow.js.
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  useEffect(() => {
    if (person.hasImage) {
      storage
        .ref("profilePictures/" + person.id)
        .getDownloadURL()
        .then(setImageUri);
    }
  }, [person.hasImage, person.id]);

  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const fullName = [person.firstName, person.lastName].filter(Boolean).join(" ");

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(person)} activeOpacity={0.7}>
      <View style={styles.left}>
        <Image
          source={imageUri ? { uri: imageUri } : undefined}
          placeholder={avatarPlaceholder}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          style={styles.avatar}
        />
        <Header4Text
          color={tokens.onBackground}
          numberOfLines={1}
          style={fontsLoaded ? { fontFamily: "Inter_600SemiBold", fontSize: 13 } : { fontSize: 13 }}
        >
          {fullName}
        </Header4Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={tokens.onBackground} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    width: "100%",
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 19,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default React.memo(SmallUserListItem);
