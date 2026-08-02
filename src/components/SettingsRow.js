import React from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";
import { radiusTokens } from "../theme/radiusTokens";
import useRipple from "./utils/useRipple";
import Header4Text from "./typography/Header4Text";
import SubBodyText from "./typography/SubBodyText";
import Switch from "./Switch";

// A single row in a settings list: optional leading icon, title (+ optional
// subtitle), and a trailing chevron/switch/nothing. Used for every row on
// the Settings screen and anywhere else a token-driven preference list is
// needed. Ripple matches the touch-point ripple used on LargeButton.
const SettingsRow = ({
  icon,
  title,
  subtitle,
  accessory = "chevron",
  value,
  onValueChange,
  onPress,
  destructive = false,
  testID,
}) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const { onLayout, onPressIn, rippleStyle } = useRipple();

  const handlePress = () => {
    if (accessory === "switch") onValueChange?.(!value);
    onPress?.();
  };

  const titleColor = destructive ? tokens.error : tokens.onBackground;

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <Pressable onPress={handlePress} onPressIn={onPressIn} style={styles.row} testID={testID}>
        <Animated.View
          pointerEvents="none"
          style={[rippleStyle, { backgroundColor: `${tokens.textMedium}26` }]}
        />
        {icon && <Ionicons name={icon} size={24} color={tokens.onBackground} />}
        <View style={styles.textContainer}>
          <Header4Text color={titleColor}>{title}</Header4Text>
          {subtitle && <SubBodyText color={tokens.textMedium}>{subtitle}</SubBodyText>}
        </View>
        {accessory === "chevron" && (
          <Ionicons name="chevron-forward" size={20} color={tokens.textMedium} />
        )}
        {accessory === "switch" && (
          <Switch value={value} onValueChange={onValueChange} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radiusTokens.small,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 35,
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 4,
  },
});

export default SettingsRow;
