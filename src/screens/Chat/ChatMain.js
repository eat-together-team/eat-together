import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../navigation/useScreenOptions";

import Chats from "./Chats";
import ArchivedChats from "./ArchivedChats";
import ChatRoom from "./ChatRoom";
import ChatRoomDetails from "./ChatRoomDetails";
import ChatSettings from "./ChatSettings";
import GroupSettings from "./GroupSettings";
import AddGroupMembers from "./AddGroupMembers";
import NewChat from "./NewChat";
import MessageRequests from "./MessageRequests";
import ImageViewer from "./ImageViewer";
import FullProfile from "../Explore/People/FullProfile";


import Requests from "../Connections/Requests";
import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import MeetupArchive from "../Profile/MeetupArchive";
import ReportEvent from "../Home/ReportEvent";
import EventGallery from "../Home/EventGallery";
import EventPhotoViewer from "../Home/EventPhotoViewer";
import InvitePeople from "../Organize/InvitePeople";
import GroupChat from "./GroupChat";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Chats"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="ArchivedChats" component={ArchivedChats} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="ChatRoomDetails" component={ChatRoomDetails}/>
      <Stack.Screen name="ChatSettings" component={ChatSettings}/>
      <Stack.Screen name="GroupSettings" component={GroupSettings}/>
      <Stack.Screen name="AddGroupMembers" component={AddGroupMembers}/>
      <Stack.Screen name="NewChat" component={NewChat}/>
      <Stack.Screen name="MessageRequests" component={MessageRequests}/>
      <Stack.Screen name="ImageViewer" component={ImageViewer}/>
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Chats" />}
      </Stack.Screen>


      <Stack.Screen name="Requests">
        {props => <Requests {...props} back="Chats"/>}
      </Stack.Screen>
      <Stack.Screen name="FullCard" component={FullCard}/>
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="EventPhotoViewer" component={EventPhotoViewer} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="GroupChat" component={GroupChat}/>
      <Stack.Screen name="ReportPerson" component={ReportPerson}/>
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
    </Stack.Navigator>
  );
}
