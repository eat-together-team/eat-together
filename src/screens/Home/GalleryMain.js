import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import Gallery from "./Gallery";
const Stack = createNativeStackNavigator();

export default function(){
    return(
        <Stack.Navigator
      initialRouteName="Gallery"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
    );

}