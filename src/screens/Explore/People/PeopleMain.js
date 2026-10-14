import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useScreenOptions from "../../../navigation/useScreenOptions";

import People from "./People";
import FullProfile from "./FullProfile";

const Stack = createNativeStackNavigator();

// Only ever mounted nested inside ExploreMain (as its "People" route) — so
// any screen ExploreMain already registers (FullCard, ReportPerson,
// ReportEvent, EventGallery, InvitePeople, MeetupArchive) is reachable from
// here via bubbling and shouldn't be re-registered. React Navigation warns
// ("Found screens with the same name nested inside one another") and can
// resolve navigate() calls to the wrong copy when a name is duplicated
// between a navigator and one nested inside it. FullProfile is the one
// exception, kept here because it needs a People-specific `blockBack`.
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
    </Stack.Navigator>
  );
}
