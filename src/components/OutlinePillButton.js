import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";

// A small outlined pill button — border and text always the same color.
// Used for both the "View" action on a message request row and the
// "Request" action on a non-connection in New Chat; only the color differs.
const OutlinePillButton = ({ label, onPress, color, disabled, style }) => {
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: color, opacity: disabled ? 0.5 : 1 }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Header4Text
        color={color}
        style={fontsLoaded ? { fontFamily: "Inter_600SemiBold", fontSize: 13 } : { fontSize: 13 }}
      >
        {label}
      </Header4Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
});

export default OutlinePillButton;
