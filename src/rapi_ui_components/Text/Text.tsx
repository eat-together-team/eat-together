import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { useTheme } from "../../provider/ThemeProvider";

const fontSize = { sm: 12, md: 14, lg: 16, xl: 18 } as const;
const normal = {
  regular: "Ubuntu_400Regular",
  bold: "Ubuntu_700Bold",
  light: "Ubuntu_300Light",
} as const;
const italic = {
  regular: "Ubuntu_400Regular_Italic",
  bold: "Ubuntu_700Bold_Italic",
  light: "Ubuntu_300Light_Italic",
} as const;

const THEME_COLORS = {
  light: {
    textColor: "#000000",
    primary: "#007AFF",
    success: "#34C759",
    warning: "#FF9500",
    info: "#5AC8FA",
    danger: "#FF3B30",
  },
  dark: {
    textColor: "#FFFFFF",
    primary: "#0A84FF",
    success: "#30D158",
    warning: "#FF9F0A",
    info: "#64D2FF",
    danger: "#FF453A",
  },
} as const;

interface Props extends TextProps {
  fontWeight?: keyof typeof normal;
  italic?: boolean;
  size?: keyof typeof fontSize;
  style?: TextStyle;
  status?: "primary" | "success" | "warning" | "info" | "danger";
}

const StyledText: React.FC<Props> = (props: Props) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  const font = () => {
    if (props.italic) {
      if (props.fontWeight) {
        return italic[props.fontWeight];
      }
      return italic.regular;
    } else {
      if (props.fontWeight) {
        return normal[props.fontWeight];
      }
      return normal.regular;
    }
  };

  const size = () => {
    if (props.style?.fontSize) {
      return props.style?.fontSize;
    } else {
      return props.size ? fontSize[props.size] : fontSize.lg;
    }
  };

  const color = props.status
    ? themeDefaults[props.status]
    : props.style?.color ?? themeDefaults.textColor;

  return (
    <Text
      {...props}
      style={{
        ...props.style,
        fontFamily: font(),
        fontSize: size(),
        color,
      }}
    />
  );
};

export default StyledText;
