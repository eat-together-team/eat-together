import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Home from "./Home";
import WhileYouEat from "./WhileYouEat";
import ReportEvent from "./ReportEvent";
import EditEvent from "./EditEvent";
import FullProfile from "../Explore/People/FullProfile";
import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import ChatRoom from "../Chat/ChatRoom";
import Recommendation from "../Notifications/Recommendation";
import InvitePeople from "../Organize/InvitePeople";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="WhileYouEat" component={WhileYouEat} />
      <Stack.Screen name="ReportEvent" component={ReportEvent} />
      <Stack.Screen name="EditEvent" component={EditEvent} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Home" />}
      </Stack.Screen>
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ChatRoom" component={ChatRoom} />
      <Stack.Screen name="Recommendation" component={Recommendation} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
    </Stack.Navigator>
  );
}
