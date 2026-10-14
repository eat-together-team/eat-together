import React from "react";
import { Platform, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import useCachedResources from "../hooks/useCachedResources";

const THEME_COLORS = {
  light: {
    statusBarColor: "#FFFFFF",
    safeAreaBackground: "#FFFFFF",
  },
  dark: {
    statusBarColor: "#000000",
    safeAreaBackground: "#000000",
  },
} as const;

type ContextProps = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isDarkmode?: boolean;
  images?: Array<any> | null;
  fonts?: any;
};

const ThemeContext = React.createContext<ContextProps>({
  theme: "light",
  setTheme: (theme) => console.warn("no theme provider"),
});

const useTheme = () => React.useContext(ThemeContext);

const ThemeProvider = (props: {
  theme?: "light" | "dark";
  isDarkmode?: boolean;
  images?: Array<any> | null;
  fonts?: any;
  children?: React.ReactNode;
  loading?: React.ReactNode;
}) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = React.useState<"light" | "dark">(
    props.theme || (systemColorScheme === "dark" ? "dark" : "light")
  );

  React.useEffect(() => {
    if (!props.theme) {
      setTheme(systemColorScheme === "dark" ? "dark" : "light");
    }
  }, [systemColorScheme, props.theme]);

  const isLoadingComplete = useCachedResources(props.images, props.fonts);
  const isDarkmode = theme === "dark";

  React.useEffect(() => {
    // Android's edge-to-edge enforcement means the nav bar background can no
    // longer be colored (it's always transparent), but the icon style is
    // still ours to set — keep it legible against our own light/dark content
    // showing through behind it.
    if (Platform.OS === "android") {
      NavigationBar.setStyle(isDarkmode ? "light" : "dark");
    }
  }, [isDarkmode]);

  const themeDefaults = THEME_COLORS[theme];
  return (
    <ThemeContext.Provider value={{ theme, isDarkmode, setTheme }}>
      <StatusBar
        backgroundColor={themeDefaults.statusBarColor}
        style={isDarkmode ? "light" : "dark"}
      />
      <SafeAreaProvider
        style={{
          backgroundColor: themeDefaults.safeAreaBackground,
        }}
      >
        {!isLoadingComplete
          ? props.loading
            ? props.loading
            : null
          : props.children}
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext, useTheme, ContextProps };
