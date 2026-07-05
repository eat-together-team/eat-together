import { useTheme } from "../provider/ThemeProvider";
import { colorTokens } from "../theme/colorTokens";

// Shared screenOptions for every stack navigator in the app. `contentStyle`
// sets the background of react-native-screens' native Screen container to
// the current theme's background — without it, that container defaults to
// white, which is what showed up as a flash/sliver of white during slide
// transitions in dark mode (the native card behind the screen, not the
// screen's own content, which was already theme-aware).
export default function useScreenOptions() {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return {
    headerShown: false,
    animation: "simple_push",
    animationDuration: 175,
    contentStyle: { backgroundColor: tokens.background },
  };
}
