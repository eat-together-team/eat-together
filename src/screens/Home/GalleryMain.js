import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Gallery from "./Gallery";
const Stack = createNativeStackNavigator();

export default function(){
    return(
        <Stack.Navigator
      initialRouteName="Gallery"
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
      }}
    >
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
    );

}