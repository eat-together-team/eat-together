//Custom bottom tab bar: the Event pill sits fixed on the left, the
//remaining tabs are centered as a group in the leftover space.

import React from "react";
import { Platform, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import RippleTouchable from "./RippleTouchable";
import EventTabButton from "./EventTabButton";
import { useTutorial, useTutorialTarget } from "../../provider/TutorialProvider";

// The bar only ever shows on these three tabs' own root screen — Explore,
// Inbox, and Account (your own profile) are the actual "home" flow.
// Organize/Event (a top-level MainStack screen, not a tab — see
// AppNavigator.js) and every other nested screen everywhere (someone else's
// FullProfile, all settings screens, chat sub-screens, etc.) are each their
// own page, not part of that persistent home experience, so they hide it.
// This is an allowlist rather than a blocklist of nested screen names on
// purpose — a blocklist has to be remembered and extended for every new
// nested screen added later; this way new screens are hidden by default.
const HOME_ROOT_SCREEN_BY_TAB = {
  Explore: "Explore",
  Notifs: "Chats",
  Profile: "Me",
};

export default function BottomTabBar({ state, descriptors, navigation, insets }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  // Hooks must run on every render regardless of the early "not at home
  // root" return below, so the tutorial target refs (and the tab bar's own
  // registration of them) are grabbed up front.
  const { activeTargetKey } = useTutorial();
  const newEventTargetRef = useTutorialTarget("newEvent");
  const targetRefByRoute = {
    Explore: useTutorialTarget("Explore"),
    Notifs: useTutorialTarget("Notifs"),
    Profile: useTutorialTarget("Profile"),
  };

  const focusedTab = state.routes[state.index];
  // getFocusedRouteNameFromRoute returns undefined until the nested
  // navigator's state actually exists — treated the same as "at its own
  // root" here, since that's exactly what an uninitialized nested stack is.
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedTab);
  const homeRootScreen = HOME_ROOT_SCREEN_BY_TAB[focusedTab.name];
  const isAtHomeRoot =
    !!homeRootScreen && (focusedRouteName === undefined || focusedRouteName === homeRootScreen);

  if (!isAtHomeRoot) {
    return null;
  }

  // Organize lives on the outer MainStack (see AppNavigator.js) rather than
  // as a tab, so pressing back from it pops back to Home instead of hitting
  // the tab navigator's exit-the-app back behavior, and it gets the same
  // default push transition as every other MainStack screen. navigate()
  // still finds it fine from here — React Navigation walks up to the
  // nearest ancestor navigator that has a matching route name.
  const handleEventPress = () => {
    navigation.navigate("Organize");
  };

  const renderTab = (route) => {
    const index = state.routes.indexOf(route);
    // Force the "focused" (colored) icon style while this tab is the
    // tutorial's current target, even if it isn't the actually-focused tab
    // (e.g. highlighting Inbox/Account while still on Explore) — mirrors
    // what the highlighted tab looks like once you actually switch to it.
    const isFocused = state.index === index || activeTargetKey === route.name;
    const { options } = descriptors[route.key];
    const isAccount = route.name === "Profile";

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (event.defaultPrevented) {
        return;
      }

      if (state.index !== index) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: "tabLongPress", target: route.key });
    };

    return (
      <RippleTouchable
        key={route.key}
        ref={targetRefByRoute[route.name]}
        onPress={onPress}
        onLongPress={onLongPress}
        variant={isAccount ? "neutral" : "primary"}
      >
        {options.tabBarIcon?.({ focused: isFocused })}
      </RippleTouchable>
    );
  };

  return (
    <View style={{ position: "relative" }}>
      {/* iOS's shadow* props and Android's elevation don't produce the same
          look (elevation can't do a directional/negative offset shadow), so
          use a plain gradient for a shadow that's identical on both
          platforms instead of relying on native shadow rendering. A fully
          black-based gradient blends into an already-near-black background,
          so dark mode fades to a lighter gray (still a "dark" shadow tone,
          just distinguishable from the background behind it) instead. */}
      <LinearGradient
        pointerEvents="none"
        colors={
          theme === "dark"
            ? [`${tokens.containerMedium}00`, `${tokens.containerMedium}33`]
            : ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)"]
        }
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: -10,
          height: 10,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: tokens.background,
          paddingTop: 15,
          // Extends the bar's background all the way behind the system nav
          // bar/home indicator instead of stopping short of it, which is
          // what left the OS's own (grayish) edge-to-edge scrim visible.
          // Android gets a little extra on top of that to clear its system
          // gesture/nav bar UI more comfortably.
          paddingBottom:
            Math.max(insets?.bottom ?? 0, 20) + (Platform.OS === "android" ? 5 : 0),
          paddingHorizontal: 30,
          overflow: "hidden",
        }}
      >
        <RippleTouchable ref={newEventTargetRef} onPress={handleEventPress} variant="primary">
          <EventTabButton />
        </RippleTouchable>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 36,
            marginLeft: 24,
          }}
        >
          {state.routes.map(renderTab)}
        </View>
      </View>
    </View>
  );
}
