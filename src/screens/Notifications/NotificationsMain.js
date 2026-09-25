import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import Notifications from "./Notifications";
import NotificationFull from "./NotificationFull";
import ReportInvite from "./ReportInvite";
import Requests from "../Connections/Requests";
import ChatRoom from "../Chat/ChatRoom";

import FullCard from "../Explore/FullCard";
import FullProfile from "../Explore/People/FullProfile";
import MeetupArchive from "../Profile/MeetupArchive";
import MyEvents from "../Profile/MyEvents";
import Connections from "../Connections/Connections";
import StarredRestaurants from "../Profile/StarredRestaurants";
import Gallery from "../Home/Gallery";
import GalleryPhotoViewer from "../Home/GalleryPhotoViewer";
import OrganizeFlow from "../Organize/NewEvent/OrganizeFlow";

import Recommendation from "../Recommendations/Recommendation";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Notifications"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="NotificationFull" component={NotificationFull} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="FullProfile" component={FullProfile} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="Connections" component={Connections} />
      <Stack.Screen name="StarredRestaurants" component={StarredRestaurants} />
      <Stack.Screen name="Gallery" component={Gallery} />
      <Stack.Screen name="GalleryPhotoViewer" component={GalleryPhotoViewer} />
      <Stack.Screen name="OrganizeFlow" component={OrganizeFlow} />

      <Stack.Screen name="Recommendation" component={Recommendation} />
      
      <Stack.Screen name="ReportInvite" component={ReportInvite} />
      <Stack.Screen name="Requests" component={Requests} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="ConnectionRequests" component={Requests} /> 
    </Stack.Navigator>
  );
}
