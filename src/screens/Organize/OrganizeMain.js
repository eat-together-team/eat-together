import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Organize from "./Organize";
import InvitePeople from "./InvitePeople";
import FullProfile from "../Explore/People/FullProfile";
import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Organize"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Organize" component={Organize} />
      <Stack.Screen name="InvitePeople" component={InvitePeople} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Organize" />}
      </Stack.Screen>
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
    </Stack.Navigator>
  );
}
