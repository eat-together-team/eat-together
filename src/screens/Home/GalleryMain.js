import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Gallery from "./Gallery";
const Stack = createStackNavigator();

export default function(){
    return(
        <Stack.Navigator
      initialRouteName="Gallery"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
    );

}