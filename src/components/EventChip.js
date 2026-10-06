// Small "EVENT" pill shown above a chat's name in the inbox when that chat
// is an event's group chat (see startEventChat in Chats.js) — matches
// Figma's "Dining Chip" component.

import React from "react";
import { View, StyleSheet } from "react-native";
import FastFoodIcon from "./icons/FastFoodIcon";
import LabelText from "./typography/LabelText";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import { useTheme } from "../rapi_ui_components";

const EventChip = () => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: `${tokens.primaryContainer}80`, borderColor: tokens.primary },
      ]}
    >
      <FastFoodIcon size={12} color={tokens.primary} />
      <LabelText color={tokens.primary}>EVENT</LabelText>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radiusTokens.extraLarge,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default EventChip;
