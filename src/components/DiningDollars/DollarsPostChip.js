// OFFER / REQUEST pill on dining dollar cards, swapped for PENDING / READY once
// the viewer has a claim on the post — Figma's "Exchange Chip" component.

import React from "react";
import { View, StyleSheet } from "react-native";
import LabelText from "../typography/LabelText";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import { useTheme } from "../../rapi_ui_components";

const chipColors = (variant, tokens) => {
  switch (variant) {
    case "request":
      return { backgroundColor: tokens.requestTagContainer, borderColor: tokens.requestTagBorder, color: tokens.requestTagBorder };
    case "pending":
      return { backgroundColor: tokens.containerMedium, borderColor: tokens.outline, color: tokens.textMedium };
    case "ready":
      return { backgroundColor: `${tokens.primaryContainer}80`, borderColor: tokens.primary, color: tokens.primary };
    case "offer":
    default:
      return { backgroundColor: tokens.offerTagContainer, borderColor: tokens.offerTagBorder, color: tokens.offerTagBorder };
  }
};

const LABELS = { offer: "OFFER", request: "REQUEST", pending: "PENDING", ready: "READY" };

// `variant`: "offer" | "request" | "pending" | "ready"
const DollarsPostChip = ({ variant = "offer" }) => {
  const { theme } = useTheme();
  const { color, ...chipStyle } = chipColors(variant, colorTokens[theme]);

  return (
    <View style={[styles.chip, chipStyle]}>
      <LabelText color={color}>{LABELS[variant]}</LabelText>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: radiusTokens.extraLarge,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

export default DollarsPostChip;
