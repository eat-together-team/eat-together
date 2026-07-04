import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Chats from "./Chats";
import ArchivedChats from "./ArchivedChats";
import ChatRoom from "./ChatRoom";
import ChatRoomDetails from "./ChatRoomDetails";
import FullProfile from "../Explore/People/FullProfile";


import Requests from "../Connections/Requests";
import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import MeetupArchive from "../Profile/MeetupArchive";
import ReportEvent from "../Home/ReportEvent";
import GroupChat from "./GroupChat";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Chats"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Chats" component={Chats} />
      <Stack.Screen name="ArchivedChats" component={ArchivedChats} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="ChatRoomDetails" component={ChatRoomDetails}/>
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Chats" />}
      </Stack.Screen>


      <Stack.Screen name="Requests">
        {props => <Requests {...props} back="Chats"/>}
      </Stack.Screen>
      <Stack.Screen name="FullCard" component={FullCard}/>
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="GroupChat" component={GroupChat}/>
      <Stack.Screen name="ReportPerson" component={ReportPerson}/>
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
    </Stack.Navigator>
  );
}
