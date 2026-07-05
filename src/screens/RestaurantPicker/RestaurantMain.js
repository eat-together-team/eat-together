import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Restaurant from "./Restaurant";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Restaurant"
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
      }}
    >
        <Stack.Screen name="Restaurant" component={Restaurant}></Stack.Screen>
    </Stack.Navigator>
  );
}
