import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import Organize from "./Organize";
import InvitePeople from "./InvitePeople";
import FullProfile from "../Explore/People/FullProfile";

import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import EventGallery from "../Home/EventGallery";
import MeetupArchive from "../Profile/MeetupArchive";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Organize"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="Organize" component={Organize} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Organize" />}
      </Stack.Screen>

      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
    </Stack.Navigator>
  );
}
