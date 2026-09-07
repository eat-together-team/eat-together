import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";
import Me from "./Me";
import Edit from "./Edit";
import EditTags from "./EditTags";
import Connections from "../Connections/Connections";
import Requests from "../Connections/Requests";

import Settings from "./Settings";
import FullCard from "../Explore/FullCard";
import ReportBug from "./ReportBug";
import SuggestIdea from "./SuggestIdea";
import Recommendations from "./Recommendations";
import AccountPrivacy from "./AccountPrivacy";
import NotificationsSettings from "./Notifications";
import FullProfile from "../Explore/People/FullProfile";
import ReportPerson from "../Explore/People/ReportPerson";
import ColorSelector from "./ColorSelector";
import EventGallery from "../Home/EventGallery";
import EventPhotoViewer from "../Home/EventPhotoViewer";
import AddTaggedPerson from "../Home/AddTaggedPerson";
import ChatRoom from "../Chat/ChatRoom";
import GroupSettings from "../Chat/GroupSettings";
import ChatSettings from "../Chat/ChatSettings";
import Gallery from "../Home/Gallery";
import MeetupArchive from "./MeetupArchive";
import MyEvents from "./MyEvents";
import OrganizeFlow from "../Organize/NewEvent/OrganizeFlow";
import StarredRestaurants from "./StarredRestaurants";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Me"
      screenOptions={useScreenOptions()}
    >
      {/* Main pages */}
      <Stack.Screen name="Me" component={Me} />
      <Stack.Screen name="Edit" component={Edit} />
      <Stack.Screen name="EditTags" component={EditTags} />
      <Stack.Screen name="Connections" component={Connections} />
      <Stack.Screen name="Requests">
        {props => <Requests {...props} back="Me" />}
      </Stack.Screen>


      {/* For settings */}
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="GroupSettings" component={GroupSettings} />
      <Stack.Screen name="ChatSettings" component={ChatSettings} />
      <Stack.Screen name="Report Bug" component={ReportBug} />
      <Stack.Screen name="Suggest Idea" component={SuggestIdea} />
      <Stack.Screen name="Recommendations" component={Recommendations} />
      <Stack.Screen name="Account Privacy" component={AccountPrivacy} />
      <Stack.Screen name="Notifications" component={NotificationsSettings} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Me" />}
      </Stack.Screen>
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ColorPicker" component={ColorSelector} />

      {/* Photo Gallery */}
      <Stack.Screen name="Gallery" component={Gallery} />
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="EventPhotoViewer" component={EventPhotoViewer} />
      <Stack.Screen name="AddTaggedPerson" component={AddTaggedPerson} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="MyEvents" component={MyEvents} />
      <Stack.Screen name="OrganizeFlow" component={OrganizeFlow} />
      <Stack.Screen name="StarredRestaurants" component={StarredRestaurants} />
    </Stack.Navigator>
  );
}
