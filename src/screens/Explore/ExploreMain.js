import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";

import Explore from "./Explore";
import AllEvents from "./AllEvents";
import FullCard from "./FullCard";
import PeopleMain from "./People/PeopleMain";
import FullProfile from "./People/FullProfile";
import ReportPerson from "../Explore/People/ReportPerson";
import ReportEvent from "../Home/ReportEvent";
import EventGallery from "../Home/EventGallery";
import EventPhotoViewer from "../Home/EventPhotoViewer";
import AddTaggedPerson from "../Home/AddTaggedPerson";
import ChatRoom from "../Chat/ChatRoom";
import GroupSettings from "../Chat/GroupSettings";
import ChatSettings from "../Chat/ChatSettings";
import InvitePeople from "../Organize/InvitePeople";
import MeetupArchive from "../Profile/MeetupArchive";
import MyEvents from "../Profile/MyEvents";
import OrganizeFlow from "../Organize/NewEvent/OrganizeFlow";
import RestaurantMain from "../RestaurantPicker/RestaurantMain";
import Recommendation from "../Recommendations/Recommendation";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Explore"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="Explore" component={Explore} />
      <Stack.Screen name="AllEvents" component={AllEvents} />
      <Stack.Screen name="Recommendation" component={Recommendation} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="GroupSettings" component={GroupSettings} />
      <Stack.Screen name="ChatSettings" component={ChatSettings} />
      <Stack.Screen name="People" component={PeopleMain} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Explore" />}
      </Stack.Screen>
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="OrganizeFlow" component={OrganizeFlow} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="EventPhotoViewer" component={EventPhotoViewer} />
      <Stack.Screen name="AddTaggedPerson" component={AddTaggedPerson} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
      <Stack.Screen name="Restaurant" component={RestaurantMain} />
    </Stack.Navigator>
  );
}
