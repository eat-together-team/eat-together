//Controls style of icons in bottom navigation bar

import React from "react";
import { Text, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

const ICON_SLOT_SIZE = 32;

export default (props) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const focusedColor = props.focusedColor ?? tokens.primary;
  const color = props.focused ? focusedColor : tokens.textLight;

  return (
    <View style={{ width: 44, justifyContent: "center", alignItems: "center", gap: 9 }}>
      <View
        style={{
          width: ICON_SLOT_SIZE,
          height: ICON_SLOT_SIZE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {props.iconElement ??
          (props.icon && (
            <View>
              <Ionicons name={props.icon} size={24} color={color} />
              {props.showBadge && (
                <View
                  style={{
                    position: "absolute",
                    top: -1,
                    right: -1,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: tokens.error,
                  }}
                />
              )}
            </View>
          ))}
      </View>
      <Text
        fontWeight="bold"
        style={{
          color,
          fontSize: 11,
        }}
      >
        {props.title}
      </Text>
    </View>
  );
};
