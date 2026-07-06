import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Restaurant from "./Restaurant";
import TagSearchScreen from "./TagSearchScreen";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Restaurant"
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
        <Stack.Screen name="Restaurant" component={Restaurant} />
        <Stack.Screen name="TagSearch" component={TagSearchScreen} />
    </Stack.Navigator>
  );
}
