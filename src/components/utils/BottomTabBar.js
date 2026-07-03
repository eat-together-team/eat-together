//Custom bottom tab bar: the Event pill sits fixed on the left, the
//remaining tabs are centered as a group in the leftover space.

import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import RippleTouchable from "./RippleTouchable";

const EVENT_ROUTE_NAME = "Organize";

export default function BottomTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

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
        color={isAccount ? tokens.onBackground : tokens.primary}
      >
        {options.tabBarIcon?.({ focused: isFocused })}
      </RippleTouchable>
    );
  };

  const eventRoute = state.routes.find((r) => r.name === EVENT_ROUTE_NAME);
  const otherRoutes = state.routes.filter((r) => r.name !== EVENT_ROUTE_NAME);

  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 2.5,
        elevation: 4,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: tokens.background,
          paddingTop: 15,
          paddingBottom: 20,
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
