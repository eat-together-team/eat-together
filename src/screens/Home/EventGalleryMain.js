import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import EventGallery from "./EventGallery";
const Stack = createStackNavigator();

export default function(){
    return(
        <Stack.Navigator
      initialRouteName="EventGallery"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="EventGallery" component={EventGallery} />
    </Stack.Navigator>
);
    }
