import React, { useState } from "react";
import { View, TextInput as RNTextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_400Regular } from "@expo-google-fonts/inter";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";

// The chat message input — mirrors TextInputField's look (border, radius,
// focus-state darkening) but adds a row of removable thumbnails above the
// text row for images staged from the gallery/camera before sending.
const ChatComposer = ({ value, onChangeText, attachments = [], onRemoveAttachment, style }) => {
  const [fontsLoaded] = useFonts({ Inter_400Regular });
  const { theme } = useTheme();
  const colors = colorTokens[theme];
  const [isFocused, setIsFocused] = useState(false);

  const fontFamily = fontsLoaded
    ? "Inter_400Regular"
    : Platform.OS === "ios" ? "AppleSDGothicNeo-Regular" : "sans-serif";

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isFocused ? `${colors.textMedium}CC` : colors.outline,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {attachments.length > 0 && (
        <View style={styles.attachmentsRow}>
          {attachments.map((uri, index) => (
            <View key={uri + index} style={styles.attachmentWrapper}>
              <Image source={{ uri }} style={styles.attachmentThumb} contentFit="cover" />
              <TouchableOpacity
                style={[
                  styles.removeButton,
                  { backgroundColor: colors.background, borderColor: colors.outline },
                ]}
                onPress={() => onRemoveAttachment?.(index)}
                hitSlop={6}
              >
                <Ionicons name="close" size={12} color={colors.onBackground} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <RNTextInput
        style={[styles.input, { fontFamily, color: colors.onBackground }]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Message"
        placeholderTextColor={colors.textLight}
        autoCorrect={false}
        multiline
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: radiusTokens.small,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    minHeight: 47,
    justifyContent: "center",
  },
  attachmentsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  attachmentWrapper: {
    position: "relative",
  },
  attachmentThumb: {
    width: 60,
    height: 60,
    borderRadius: radiusTokens.small,
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    fontSize: 13,
    padding: 0,
  },
});

export default ChatComposer;
