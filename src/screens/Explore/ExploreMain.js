import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Explore from "./Explore";
import FullCard from "./FullCard";
import PeopleMain from "./People/PeopleMain";
import FullProfile from "./People/FullProfile";
import ReportPerson from "../Explore/People/ReportPerson";
import ReportEvent from "../Home/ReportEvent";
import RestaurantMain from "../RestaurantPicker/RestaurantMain";

const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Explore"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Explore" component={Explore} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="People" component={PeopleMain} screenOptions={{
        animationEnabled: false,
      }} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Explore" />}
      </Stack.Screen>
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
      <Stack.Screen name="AvailabilitiesStatic" component={AvailabilitiesStatic}/>
      <Stack.Screen name="Restaurant" component={RestaurantMain} screenOptions={{
        animationEnabled: true,
      }} />
    </Stack.Navigator>
  );
}
