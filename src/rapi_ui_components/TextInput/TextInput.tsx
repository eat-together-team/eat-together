import React from "react";
import {
  ColorValue,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../provider/ThemeProvider";

const THEME_COLORS = {
  light: {
    backgroundColor: "#FFFFFF",
    borderColor: "#8E8E93",
    placeholderTextColor: "#8E8E93",
    color: "#000000",
  },
  dark: {
    backgroundColor: "#2C2C2E",
    borderColor: "#636366",
    placeholderTextColor: "#8E8E93",
    color: "#FFFFFF",
  },
} as const;

interface Props extends TextInputProps {
  containerStyle?: ViewStyle;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: number;
}

const StyledTextInput: React.FC<Props> = React.forwardRef((props: Props, ref: any) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  const {
    containerStyle,
    leftContent,
    rightContent,
    backgroundColor = containerStyle?.backgroundColor ?? themeDefaults.backgroundColor,
    borderColor = themeDefaults.borderColor,
    borderWidth = containerStyle?.borderWidth || 1,
    borderRadius = containerStyle?.borderRadius || 8,

    ...otherProps
  } = props;

  return (
    <View
      style={{
        ...containerStyle,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: borderWidth,
        borderRadius: borderRadius,
        flexDirection: containerStyle?.flexDirection || "row",
        paddingHorizontal: containerStyle?.paddingHorizontal || 20,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {leftContent}
      <TextInput
        {...otherProps}
        ref={ref}
        placeholderTextColor={themeDefaults.placeholderTextColor}
        style={{
          flex: 1,
          color: themeDefaults.color,
          paddingVertical: containerStyle?.padding || 10,
          fontFamily: "Ubuntu_400Regular",
          marginLeft: leftContent ? 5 : 0,
          marginRight: rightContent ? 5 : 0,
        }}
      />
      {rightContent}
    </View>
  );
});
export default StyledTextInput;
