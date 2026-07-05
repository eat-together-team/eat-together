import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "./Home";
import WhileYouEat from "./WhileYouEat";
import ReportEvent from "./ReportEvent";
import EditEvent from "./EditEvent";
import FullProfile from "../Explore/People/FullProfile";

import Gallery from "./Gallery";
import EventGallery from "./EventGallery";
import FullCard from "../Explore/FullCard";
import ReportPerson from "../Explore/People/ReportPerson";
import MeetupArchive from "../Profile/MeetupArchive";
import ChatRoom from "../Chat/ChatRoom";
import Recommendation from "../Recommendations/Recommendation";
import InvitePeople from "../Organize/InvitePeople";
// Would You Rather imports
import StartGame from "./WouldYouRather/StartGame";
import IntroGuidelines from "./WouldYouRather/IntroGuidelines";
import Question from "./WouldYouRather/Question";
import Discussion from "./WouldYouRather/Discussion";
import EndGame from "./WouldYouRather/EndGame";

const Stack = createNativeStackNavigator();

export default function () {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: "simple_push",
        animationDuration: 175,
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

      <Stack.Screen name="Gallery" component={Gallery} />
      <Stack.Screen name="EventGallery" component={EventGallery} />
      <Stack.Screen name="MeetupArchive" component={MeetupArchive} />
      {/* WYR Game Screens */}
      <Stack.Screen name="StartGame" component={StartGame}/>
      <Stack.Screen name="IntroGuidelines" component={IntroGuidelines}/>
      <Stack.Screen name="Question" component={Question}/>
      <Stack.Screen name="Discussion" component={Discussion}/>
      <Stack.Screen name="EndGame" component={EndGame} />
    </Stack.Navigator>
  );
}
