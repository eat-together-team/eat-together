import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header4Text from "./typography/Header4Text";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// Icon + short message, centered as one cluster — used wherever a section
// has nothing to show yet (profile Gallery, profile Favorite restaurants,
// Explore's Events). Keep `text` short; it's capped to a couple of lines.
const EmptySectionPlaceholder = ({ icon, text }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={tokens.textLight} />
      <Header4Text color={tokens.textLight} style={styles.text}>
        {text}
      </Header4Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  text: {
    fontSize: 17,
    lineHeight: 22,
    marginLeft: 16,
    maxWidth: 182,
  },
});

export default EmptySectionPlaceholder;
