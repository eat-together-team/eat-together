import React from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";
import { useTheme } from "../../provider/ThemeProvider";
import { colorTokens } from "../../theme/colorTokens";

interface Props extends SafeAreaViewProps {
  backgroundColor?: string;
}

const Layout: React.FC<Props> = (props: Props) => {
  const { theme } = useTheme();
  const themeDefaults = colorTokens[theme];
  return (
    <SafeAreaView
      {...props}
      edges={props.edges ?? ['top', 'left', 'right']}
      style={[
        props.style,
        {
          flex: 1,
          backgroundColor: props.backgroundColor ?? themeDefaults.background,
        },
      ]}
    >
      {props.children}
    </SafeAreaView>
  );
};

export default Layout;
