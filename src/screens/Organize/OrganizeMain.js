import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import Organize from "./Organize";
import OrganizeFlow from "./NewEvent/OrganizeFlow";
import InvitePeople from "./InvitePeople";
import FullProfile from "../Explore/People/FullProfile";

import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import EventGallery from "../Home/EventGallery";
import EventPhotoViewer from "../Home/EventPhotoViewer";
import AddTaggedPerson from "../Home/AddTaggedPerson";
import ChatRoom from "../Chat/ChatRoom";
import GroupSettings from "../Chat/GroupSettings";
import ChatSettings from "../Chat/ChatSettings";
import MeetupArchive from "../Profile/MeetupArchive";
import MyEvents from "../Profile/MyEvents";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="OrganizeFlow"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="OrganizeFlow" component={OrganizeFlow} />
      {/* Old single-page flow — kept registered (unreachable from the tab
          bar now) until the new multi-step wizard fully replaces it. */}
      <Stack.Screen name="Organize" component={Organize} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Organize" />}
      </Stack.Screen>

      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="GroupSettings" component={GroupSettings} />
      <Stack.Screen name="ChatSettings" component={ChatSettings} />
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="EventPhotoViewer" component={EventPhotoViewer} />
      <Stack.Screen name="AddTaggedPerson" component={AddTaggedPerson} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
    </Stack.Navigator>
  );
}
