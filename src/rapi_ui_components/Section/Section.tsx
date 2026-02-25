import React from "react";
import { View, ViewProps } from "react-native";
import { useTheme } from "../../provider/ThemeProvider";

const THEME_COLORS = {
  light: {
    backgroundColor: "#F2F2F7",
  },
  dark: {
    backgroundColor: "#2C2C2E",
  },
} as const;

interface Props extends ViewProps {
  children?: React.ReactNode;
  backgroundColor?: string;

  borderRadius?: number;
}

const Section: React.FC<Props> = ({
  backgroundColor,
  borderRadius = 10,
  children,
  style,
  ...otherProps
}) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  return (
    <View
      {...otherProps}
      style={[
        style,
        {
          flexDirection: "column",
          backgroundColor: backgroundColor ?? themeDefaults.backgroundColor,
          borderRadius: borderRadius,
          overflow: "hidden",
        },
      ]}
    >
      {children}
    </View>
  );
};

export default Section;
