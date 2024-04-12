import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Me from "./Me";
import Edit from "./Edit";
import EditTags from "./EditTags";
import Connections from "../Connections/Connections";
import Requests from "../Connections/Requests";

import Settings from "./Settings";
import FullCard from "./FullCard";
import ReportBug from "./ReportBug";
import SuggestIdea from "./SuggestIdea";
import FullProfile from "../Explore/People/FullProfile";
import AvailabilitiesStatic from "../Explore/People/AvailabilitiesStatic";
import ReportPerson from "../Explore/People/ReportPerson";
// Buddy Page import
import BuddyPage from "./BuddyPage";
import BuddyNotif from "./BuddyNotif";

import AvailabilitiesHome from "./Availabilities/AvailabilitiesHome";
import Availabilities from "./Availabilities/Availabilities";
import Colorpicker from "./ColorPicker";



const Stack = createStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Me"
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Me" component={Me} />
      <Stack.Screen name="Edit" component={Edit} />
      <Stack.Screen name="EditTags" component={EditTags} />
      <Stack.Screen name="Connections" component={Connections} />
      <Stack.Screen name="Requests">
        {props => <Requests {...props} back="Me" />}
      </Stack.Screen>
      {/* Adding the buddy page to the navigation stack*/}
      <Stack.Screen name="BuddyPage" component={BuddyPage} />
      <Stack.Screen name="BuddyNotif" component={BuddyNotif} />

      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="FullCard" component={FullCard} />
      <Stack.Screen name="Report Bug" component={ReportBug} />
      <Stack.Screen name="Suggest Idea" component={SuggestIdea} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Me" />}
      </Stack.Screen>
      <Stack.Screen name="AvailabilitiesStatic" component={AvailabilitiesStatic} />
      <Stack.Screen name="ReportPerson" component={ReportPerson} />

      <Stack.Screen name="AvailabilitiesHome" component={AvailabilitiesHome} />
      <Stack.Screen name="Availabilities" component={Availabilities} />
      <Stack.Screen name="ColorPicker" component={Colorpicker} />
    </Stack.Navigator>
  );
}
