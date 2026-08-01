import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";

import Restaurant from "./Restaurant";
import TagSearchScreen from "./TagSearchScreen";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Restaurant"
      screenOptions={useScreenOptions()}
    >
        <Stack.Screen name="Restaurant" component={Restaurant} />
        <Stack.Screen name="TagSearch" component={TagSearchScreen} />
    </Stack.Navigator>
  );
}
