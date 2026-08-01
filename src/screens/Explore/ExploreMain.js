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
import MeetupArchive from "../Profile/MeetupArchive";
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
      <Stack.Screen name="People" component={PeopleMain} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Explore" />}
      </Stack.Screen>
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
      <Stack.Screen name="Restaurant" component={RestaurantMain} />
    </Stack.Navigator>
  );
}
