//Controls style of icons in bottom navigation bar

import React from "react";
import { Text, themeColor} from "../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default (props) => {
  return (
    <View style={{justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
      <Ionicons
        name={props.icon}
        size={24}
        color={props.focused ? "#ADC8FF" : "rgb(143, 155, 179)"}
      />
      <Text
        fontWeight="bold"
        style={{
          color: "rgb(143, 155, 179)",
          fontSize: 10,
        }}
      >
        {props.title}
      </Text>
    </View>
  );
};
