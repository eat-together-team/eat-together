import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Explore from "./Explore";
import FullCard from "./FullCard";
import PeopleMain from "./People/PeopleMain";
import FullProfile from "./People/FullProfile";
import ReportPerson from "../Explore/People/ReportPerson";
import ReportEvent from "../Home/ReportEvent";
import MeetupArchive from "../Profile/MeetupArchive";
import RestaurantMain from "../RestaurantPicker/RestaurantMain";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Explore"
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
      }}
    >
      <Stack.Screen name="Explore" component={Explore} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="People" component={PeopleMain} screenOptions={{ animation: "simple_push", animationDuration: 175 }} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Explore" />}
      </Stack.Screen>
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
      <Stack.Screen name="Restaurant" component={RestaurantMain} screenOptions={{ animation: "simple_push", animationDuration: 175 }} />
    </Stack.Navigator>
  );
}
