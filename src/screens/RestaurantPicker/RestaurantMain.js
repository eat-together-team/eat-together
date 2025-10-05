import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Restaurant from "./Restaurant";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
        <Stack.Screen name="Restaurant" component={Restaurant}></Stack.Screen>
    </Stack.Navigator>
  );
}
