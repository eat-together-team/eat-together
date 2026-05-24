import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  const themeDefaults = THEME_COLORS[theme];
  return (
    <ThemeContext.Provider value={{ theme, isDarkmode, setTheme }}>
      <StatusBar
        backgroundColor={themeDefaults.statusBarColor}
        barStyle={isDarkmode ? "light-content" : "dark-content"}
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
