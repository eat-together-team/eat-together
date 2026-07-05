import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EventGallery from "./EventGallery";

const Stack = createNativeStackNavigator();

export default function(){
  return (
    <Stack.Navigator
      initialRouteName="EventGallery"
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
      }}
    >
      <Stack.Screen name="EventGallery" component={EventGallery} />
    </Stack.Navigator>
  );
}
