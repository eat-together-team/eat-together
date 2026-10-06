import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import Header4Text from "./typography/Header4Text";
import { radiusTokens } from "../theme/radiusTokens";

// White-outlined pill button with a trailing arrow — the CTA style for
// content sitting on top of a photo/dark-overlay background (e.g. the
// Explore feed's promo cards). Always white-on-transparent by design,
// unlike LargeButton's outlined mode, which ties border/text color to a
// semantic token for standard light-background UI.
const OutlineArrowButton = ({ label, onPress }) => {
  const [fontsLoaded] = useFonts({ Inter_600SemiBold });

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Header4Text
        color="white"
        style={fontsLoaded ? { fontFamily: "Inter_600SemiBold", fontSize: 13 } : { fontSize: 13 }}
      >
        {label}
      </Header4Text>
      <Ionicons name="arrow-forward" size={16} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    gap: 8,
    height: 41,
    paddingHorizontal: 20,
    borderRadius: radiusTokens.small,
    borderWidth: 2,
    borderColor: "white",
  },
});

export default OutlineArrowButton;
