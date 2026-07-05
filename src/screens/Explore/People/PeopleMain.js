import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../../navigation/useScreenOptions";

import People from "./People";
import ReportPerson from "./ReportPerson";
import FullProfile from "./FullProfile";
import FullCard from '../FullCard';
import ReportEvent from "../../Home/ReportEvent";
import MeetupArchive from "../../Profile/MeetupArchive";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="People"
      screenOptions={useScreenOptions()}
    >
      <Stack.Screen name="People" component={People} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="People" />}
      </Stack.Screen>
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="FullCard" component={FullCard}/>
      <Stack.Screen name="ReportEvent" component={ReportEvent}/>
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
    </Stack.Navigator>
  );
}
