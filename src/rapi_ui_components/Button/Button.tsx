import React from "react";
import {
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  ViewStyle,
  TouchableWithoutFeedbackProps,
  TextStyle,
  View,
} from "react-native";
import Text from "../Text/Text";
import { useTheme } from "../../provider/ThemeProvider";

const THEME_COLORS = {
  light: {
    primary: "#007AFF",
    white: "#FFFFFF",
    success: "#34C759",
    warning: "#FF9500",
    info: "#5AC8FA",
    danger: "#FF3B30",
    buttonDisabledColor: "#C7C7CC",
    buttonDisabledTextColor: "#8E8E93",
  },
  dark: {
    primary: "#0A84FF",
    white: "#FFFFFF",
    success: "#30D158",
    warning: "#FF9F0A",
    info: "#64D2FF",
    danger: "#FF453A",
    buttonDisabledColor: "#48484A",
    buttonDisabledTextColor: "#8E8E93",
  },
} as const;

interface ButtonProps extends TouchableWithoutFeedbackProps {
  type?: keyof typeof type;
  style?: ViewStyle;
  color?: string;
  outline?: boolean;
  inverseColor?: string;
  text?: string;
  textStyle?: TextStyle;
  size?: keyof typeof sizeProp;
  outlineWidth?: number;
  disabled?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  width?: number;
}

interface ContentProps {
  style?: ViewStyle;
  color?: string;
  outline?: boolean;
  inverseColor?: string;
  text?: string;
  textStyle?: TextStyle;
  size?: keyof typeof sizeProp;
  outlineWidth?: number;
  disabled?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  selectedColor?: any;
  selectedInverseColor?: any;
  status?: "primary" | "success" | "warning" | "info" | "danger";
}

enum sizeProp {
  sm,
  md,
  lg, // default
}

const type = {
  TouchableOpacity: "TouchableOpacity", // default
  TouchableWithoutFeedback: "TouchableWithoutFeedback",
  TouchableHighlight: "TouchableHighlight",
};

const parentStyle = {
  buttonColor: "#007AFF", // default primary, overridden by theme in component
  buttonInverseColor: "#FFFFFF", // default white, overridden by theme in component
  outlineWidth: 2,
};

const styles = {
  lg: {
    ...parentStyle,
    buttonBorderRadius: 8,
    buttonPaddingVertical: 12.5,
    buttonPaddingHorizontal: 15,
    textSize: "lg",
  },
  md: {
    ...parentStyle,
    buttonBorderRadius: 8,
    buttonPaddingVertical: 10,
    buttonPaddingHorizontal: 12.5,
    textSize: "md",
  },
  sm: {
    ...parentStyle,
    buttonBorderRadius: 8,
    buttonPaddingVertical: 7.5,
    buttonPaddingHorizontal: 12.5,
    textSize: "sm",
  },
};

const ButtonContent: React.FC<ContentProps> = (props: ContentProps) => {
  const {
    text,
    textStyle,
    outline,
    size,
    leftContent,
    rightContent,
    selectedColor,
    selectedInverseColor,
    disabled,
  } = props;
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  return (
    <>
      {leftContent}
      <Text
        style={{
          ...textStyle,
          color: textStyle?.color
            ? textStyle?.color
            : outline
            ? selectedColor
            : disabled
            ? themeDefaults.buttonDisabledTextColor
            : selectedInverseColor,
          marginLeft: textStyle?.marginLeft
            ? textStyle?.marginLeft
            : leftContent
            ? 5
            : 0,
          marginRight: textStyle?.marginRight
            ? textStyle?.marginRight
            : rightContent
            ? 5
            : 0,
        }}
        fontWeight="bold"
        size={size}
      >
        {text}
      </Text>
      {rightContent}
    </>
  );
};

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const {
    text,
    style,
    textStyle,
    outline,
    color,
    inverseColor,
    size,
    outlineWidth,
    disabled,
    leftContent,
    rightContent,
    status,
    width,
    ...buttonProp
  } = props;
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  const selectedColor = disabled
    ? themeDefaults.buttonDisabledColor
    : color
    ? color
    : status
    ? themeDefaults[status]
    : themeDefaults.primary;

  const selectedInverseColor = inverseColor
    ? inverseColor
    : status
    ? themeDefaults.white
    : themeDefaults.white;

  const containerStyle = outline
    ? {
        borderWidth: outlineWidth || styles[size || "lg"].outlineWidth,
        backgroundColor: outline ? "transparent" : selectedInverseColor,
        borderColor: selectedColor,
      }
    : { backgroundColor: selectedColor };

  const paddingHorizontal =
    style?.paddingHorizontal || styles[size || "lg"].buttonPaddingHorizontal;

  const paddingVertical = outline
    ? styles[size || "lg"].buttonPaddingVertical -
      styles[size || "lg"].outlineWidth
    : style?.paddingVertical || styles[size || "lg"].buttonPaddingVertical;

  const borderRadius =
    style?.borderRadius || styles[size || "lg"].buttonBorderRadius;

  if (props.type === "TouchableWithoutFeedback") {
    return (
      <TouchableWithoutFeedback {...buttonProp} disabled={disabled}>
        <View
          style={{
            ...style,
            ...containerStyle,
            width: width,
            flexDirection: "row",
            paddingHorizontal: paddingHorizontal,
            paddingVertical: paddingVertical,
            borderRadius: borderRadius,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ButtonContent
            {...props}
            selectedColor={selectedColor}
            selectedInverseColor={selectedInverseColor}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
  if (props.type === "TouchableHighlight") {
    return (
      <TouchableHighlight
        {...buttonProp}
        disabled={disabled}
        style={{
          ...style,
          ...containerStyle,
          width: width,
          flexDirection: "row",
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          borderRadius: borderRadius,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ButtonContent
          {...props}
          selectedColor={selectedColor}
          selectedInverseColor={selectedInverseColor}
        />
      </TouchableHighlight>
    );
  }
  return (
    <TouchableOpacity
      {...buttonProp}
      disabled={disabled}
      style={{
        ...style,
        ...containerStyle,
        width: width,
        flexDirection: "row",
        paddingHorizontal: paddingHorizontal,
        paddingVertical: paddingVertical,
        borderRadius: borderRadius,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ButtonContent
        {...props}
        selectedColor={selectedColor}
        selectedInverseColor={selectedInverseColor}
      />
    </TouchableOpacity>
  );
};

export default Button;
