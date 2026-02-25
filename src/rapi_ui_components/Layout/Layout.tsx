import React from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useTheme } from "../../provider/ThemeProvider";

const THEME_COLORS = {
  light: {
    backgroundColor: "#FFFFFF",
  },
  dark: {
    backgroundColor: "#000000",
  },
} as const;

interface Props extends SafeAreaViewProps {
  backgroundColor?: string;
}

const Layout: React.FC<Props> = (props: Props) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];
  return (
    <SafeAreaView
      {...props}
      edges={props.edges ?? ['top', 'left', 'right']}
      style={[
        props.style,
        {
          flex: 1,
          backgroundColor: props.backgroundColor ?? themeDefaults.backgroundColor,
        },
      ]}
    >
      {props.children}
    </SafeAreaView>
  );
};

export default Layout;
