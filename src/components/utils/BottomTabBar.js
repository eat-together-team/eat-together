//Custom bottom tab bar: the Event pill sits fixed on the left, the
//remaining tabs are centered as a group in the leftover space.

import React from "react";
import { Platform, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import RippleTouchable from "./RippleTouchable";

const EVENT_ROUTE_NAME = "Organize";
// Nested screens (inside a tab's own stack) that should hide the whole nav
// bar rather than just sit underneath it. bottom-tabs always calls a custom
// tabBar render prop regardless of a screen's tabBarStyle:{display:'none'}
// (that convention only self-enforces inside the library's own default
// BottomTabBar), so a custom tabBar has to opt itself out.
const HIDDEN_ON_ROUTES = ["ArchivedChats", "ChatRoom", "ChatSettings", "ImageViewer", "NewChat"];

export default function BottomTabBar({ state, descriptors, navigation, insets }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  const focusedRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(focusedRoute);
  if (HIDDEN_ON_ROUTES.includes(focusedRouteName)) {
    return null;
  }

  const renderTab = (route) => {
    const index = state.routes.indexOf(route);
    const isFocused = state.index === index;
    const { options } = descriptors[route.key];
    const isEvent = route.name === EVENT_ROUTE_NAME;
    const isAccount = route.name === "Profile";

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({ type: "tabLongPress", target: route.key });
    };

    if (isEvent) {
      return (
        <Pressable key={route.key} onPress={onPress} onLongPress={onLongPress}>
          {options.tabBarIcon?.({ focused: isFocused })}
        </Pressable>
      );
    }

    return (
      <RippleTouchable
        key={route.key}
        onPress={onPress}
        onLongPress={onLongPress}
        variant={isAccount ? "neutral" : "primary"}
      >
        {options.tabBarIcon?.({ focused: isFocused })}
      </RippleTouchable>
    );
  };

  const eventRoute = state.routes.find((r) => r.name === EVENT_ROUTE_NAME);
  const otherRoutes = state.routes.filter((r) => r.name !== EVENT_ROUTE_NAME);

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
        {eventRoute && renderTab(eventRoute)}
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
          {otherRoutes.map(renderTab)}
        </View>
      </View>
    </View>
  );
}
