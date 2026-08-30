import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import EventGallery from "./EventGallery";
import EventPhotoViewer from "./EventPhotoViewer";

const Stack = createNativeStackNavigator();

export default function(){
  return (
    <Stack.Navigator
      initialRouteName="EventGallery"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="EventPhotoViewer" component={EventPhotoViewer} />
    </Stack.Navigator>
  );
}
