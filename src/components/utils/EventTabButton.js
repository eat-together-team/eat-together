//Renders the "Event" pill button in the bottom navigation bar

import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

export default () => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <View
      style={{
        width: 102,
        height: 47,
        borderRadius: 10,
        backgroundColor: tokens.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <Ionicons name="add" size={26} color={tokens.onPrimary} />
      <Text fontWeight="bold" style={{ color: tokens.onPrimary, fontSize: 15 }}>
        Event
      </Text>
    </View>
  );
};
