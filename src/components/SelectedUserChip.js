import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import LabelText from "./typography/LabelText";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

const avatarPlaceholderLight = require("../../assets/icons/avatar-placeholder-light.png");
const avatarPlaceholderDark = require("../../assets/icons/avatar-placeholder-dark.png");

const EXIT_DURATION = 180;

// A picked recipient shown in the "who's this chat with" row — avatar with a
// small close button to remove them, first name underneath. Animates itself
// in on mount and, when told it's `exiting`, animates out in place — the
// parent removes it from the list once that finishes (see NewChat.js).
const SelectedUserChip = ({ person, exiting, onRemove }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const avatarPlaceholder = theme === "dark" ? avatarPlaceholderDark : avatarPlaceholderLight;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!exiting) return;
    Animated.timing(progress, {
      toValue: 0,
      duration: EXIT_DURATION,
      useNativeDriver: true,
    }).start();
  }, [exiting]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: progress,
          transform: [
            { scale: progress },
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.avatarWrap}>
        <Image
          source={person.image ? { uri: person.image } : undefined}
          placeholder={avatarPlaceholder}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
          style={styles.avatar}
        />
        <Pressable
          onPress={() => onRemove?.(person)}
          hitSlop={8}
          style={[styles.removeButton, { backgroundColor: tokens.onBackground }]}
        >
          <Ionicons name="close" size={12} color={tokens.background} />
        </Pressable>
      </View>
      <LabelText
        color={tokens.onBackground}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.name}
      >
        {person.firstName}
      </LabelText>
    </Animated.View>
  );
};

export { EXIT_DURATION };

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 64,
  },
  avatarWrap: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  removeButton: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 6,
    maxWidth: 64,
  },
});

export default SelectedUserChip;
