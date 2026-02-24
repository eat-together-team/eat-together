import React from "react";
import {
  ColorValue,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../provider/ThemeProvider";

const THEME_COLORS = {
  light: {
    checkedColor: "#007AFF",
    uncheckedColor: "#8E8E93",
    disabledColor: "#C7C7CC",
    inverseColor: "#FFFFFF",
  },
  dark: {
    checkedColor: "#0A84FF",
    uncheckedColor: "#8E8E93",
    disabledColor: "#48484A",
    inverseColor: "#FFFFFF",
  },
} as const;

interface Props {
  value: boolean;
  onValueChange?: (newValue: boolean) => void;
  checkedColor?: ColorValue;
  uncheckedColor?: ColorValue;
  inverseColor?: ColorValue;
  disabled?: boolean;
  style?: ViewStyle;
  size?: number;
}

const Checkbox: React.FC<Props> = ({
  value = false,
  onValueChange,
  checkedColor,
  uncheckedColor,
  inverseColor,
  disabled = false,
  size = 24,
  style,
}) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  const resolvedCheckedColor = checkedColor ?? themeDefaults.checkedColor;
  const resolvedUncheckedColor = uncheckedColor ?? themeDefaults.uncheckedColor;
  const resolvedInverseColor = inverseColor ?? themeDefaults.inverseColor;
  const resolvedDisabledColor = themeDefaults.disabledColor;

  const handleChange = () => {
    if (onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleChange}
      style={{
        ...style,
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: style?.borderRadius || 4,
        borderColor: value ? resolvedCheckedColor : resolvedUncheckedColor,
        backgroundColor: disabled
          ? resolvedDisabledColor
          : value
          ? resolvedCheckedColor
          : "transparent",
        borderWidth: 1,
      }}
      disabled={disabled}
    >
      <Ionicons
        name="checkmark"
        size={size - 2}
        color={
          disabled
            ? resolvedInverseColor
            : value
            ? resolvedInverseColor
            : resolvedUncheckedColor
        }
      />
    </TouchableOpacity>
  );
};

export default Checkbox;
