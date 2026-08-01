import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import AboutChip from "./AboutChip";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";
import { storage } from "../provider/Firebase";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const chipColorForTagType = (type) =>
  type === "school" ? "Yellow" : type === "hobby" ? "Blue" : "Purple";

// Row used for both the Explore feed's "People" preview and the full People
// list — avatar, name, bio, and up to 2 tags. Memoized since the People
// list can render many of these at once — without it, unrelated screen
// state changes (typing, focus, filters) force every visible row to
// re-render on every scroll frame.
const SuggestedPersonRow = ({ person, onPress }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [imageUri, setImageUri] = useState(null);
  // Figma's "Header 3" style (13px Semi Bold) isn't in the typography/ set —
  // same approach as ChatPreview.js: load the extra weight and override
  // Header4Text's style inline.
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
  const previewTags = (person.tags || []).slice(0, 2);

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(person)} activeOpacity={0.85}>
      <Image
        source={imageUri ? { uri: imageUri } : undefined}
        placeholder={avatarPlaceholder}
        placeholderContentFit="cover"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Header4Text
          color={tokens.onBackground}
          numberOfLines={1}
          style={fontsLoaded ? { fontFamily: "Inter_600SemiBold", fontSize: 13 } : { fontSize: 13 }}
        >
          {person.firstName} {person.lastName}
        </Header4Text>
        <SubBodyText color={tokens.onBackground} numberOfLines={1}>
          "{person.bio}"
        </SubBodyText>
        {previewTags.length > 0 && (
          // Horizontal scroll rather than flexWrap — keeps the row to a
          // single line even when both chips together don't fit, instead of
          // wrapping onto a second row (same approach as ProfileBubble.js).
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tags}
          >
            {previewTags.map((tag, index) => (
              <AboutChip key={index} text={tag.tag} color={chipColorForTagType(tag.type)} />
            ))}
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  tags: {
    flexDirection: "row",
    gap: 5,
  },
});

export default React.memo(SuggestedPersonRow);
