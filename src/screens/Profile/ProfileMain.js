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
import ReportPerson from "../Explore/People/ReportPerson";
import ColorSelector from "./ColorSelector";
import EventGallery from "../Home/EventGallery";
import Gallery from "../Home/Gallery";

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
      <Stack.Screen name="Report Bug" component={ReportBug} />
      <Stack.Screen name="Suggest Idea" component={SuggestIdea} />
      <Stack.Screen name="FullProfile">
        {props => <FullProfile {...props} blockBack="Me" />}
      </Stack.Screen>
      <Stack.Screen name="ReportPerson" component={ReportPerson} />
      <Stack.Screen name="ColorPicker" component={ColorSelector} />

      {/* Photo Gallery */}
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="Gallery" component={Gallery} />
    </Stack.Navigator>
  );
}
