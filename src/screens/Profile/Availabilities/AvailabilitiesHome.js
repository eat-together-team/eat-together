// Homepage for the availabilities screen (where you choose between linking with GCalendar or entering manually)

import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import MediumText from "../../../components/MediumText";
import Button from "../../../components/Button";

import { getFreeTimes } from "../../../methods";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  GOOGLE_AUTH_CLIENT_ID,
  GOOGLE_AUTH_CLIENT_ID_ANDROID,
  GOOGLE_AUTH_CLIENT_ID_IOS
} from "@env"; //Enviroment variables

WebBrowser.maybeCompleteAuthSession();

const AvailabilitiesHome = props => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: GOOGLE_AUTH_CLIENT_ID,
    iosClientId: GOOGLE_AUTH_CLIENT_ID_IOS,
    androidClientId: GOOGLE_AUTH_CLIENT_ID_ANDROID,
    scopes: ["https://www.googleapis.com/auth/calendar"],
    redirectUri: "https://auth.expo.io/@eat-together-team/eat-together"
  }, {
    projectNameForProxy: "@eat-together-team/eat-together",
  }); // For Google Calendar API

  const [freeTimes, setFreeTimes] = useState([]); // List of user's available times
  const [loading, setLoading] = useState(false); // Loading state

  // Connection with Google Calendar API
  useEffect(() => {
    async function fetchData() {
      if (response?.type === 'success') {
        setLoading(true);
        const accessToken = response.authentication.accessToken;
        const email = await fetchEmail(accessToken);

        // Get the Monday and Sunday occuring the week of the current date
        const date = new Date(); // Today
        const start = date.getDate() - date.getDay() + 1;
        const end = start + 6;
        const startDate = new Date(date.setDate(start));
        const endDate = new Date(date.setDate(end));

        const events = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${email}/events?access_token=${accessToken}
          &timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${accessToken}`,
          }),
        })
        .then(function (res) {
          return res.json();
        })
        .then(function (res) {
          return res.items;
        });

        // Clean up events
        const filtered = events.filter((e) => e.start && e.start.dateTime && e.end && e.end.dateTime);
        const result = filtered.map((e) => {
          // Set start and end to same day of the week but this week
          console.log(e.summary);
          const startDate = new Date(e.start.dateTime);
          const endDate = new Date(e.end.dateTime);

          const dayDiff = startDate.getDay() - new Date().getDay();
          const start = new Date();
          const end = new Date();
          
          start.setDate(start.getDate() + dayDiff);
          end.setDate(end.getDate() + dayDiff);
          start.setHours(startDate.getHours());
          start.setMinutes(startDate.getMinutes());
          start.setSeconds(0);
          end.setHours(endDate.getHours());
          end.setMinutes(endDate.getMinutes());
          end.setSeconds(0);

          return {
            dayOfWeek: new Date(e.start.dateTime).getDay(),
            start: start,
            end: end
          }
        });
        
        // Algorithm to get the user's free times
        setFreeTimes(getFreeTimes(result));
      }
    }
    
    fetchData();
  }, [response]);

  // If the user has linked with GCalendar, go to the availabilities screen
  useEffect(() => {
    setLoading(false);
    if (freeTimes.length > 0 && response !== null) {
      props.navigation.navigate("Availabilities", {
        freeTimes: freeTimes,
        user: props.route.params.user,
        updateAvailabilities: props.route.params.updateAvailabilities
      });
    }
  }, [freeTimes]);

  // Get the user's email
  const fetchEmail = async (accessToken) => {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
      {
        method: "GET",
        headers: new Headers({
          Authorization: `Bearer ${accessToken}`,
        }),
      }).then(function (res) {
        return res.json();
      });

    return response.email;
  }

  return (
    <Layout style={styles.page}>
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size={100} color="#5DB075"/>
          </View>
        )}

        <TopNav
            middleContent={
                <MediumText>Edit Eating Times</MediumText>
            }
            leftContent={
                <Ionicons
                    name="chevron-back"
                    size={20}
                />
            }
            leftAction={() => props.navigation.goBack()}
        />

        <View style={styles.main}>
            <Button disabled={!request} marginVertical={10} onPress={() => promptAsync({
              projectNameForProxy: "@eat-together-team/eat-together",
            })}>Link with Google Calendar</Button>
            <MediumText center>OR</MediumText>
            <Button marginVertical={10} onPress={() => props.navigation.navigate("Availabilities", {
              user: props.route.params.user,
              updateAvailabilities: props.route.params.updateAvailabilities
            })}>Edit manually</Button>
        </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10
  },

  main: {
    flex: 1,
    paddingHorizontal: 40,
    marginTop: 20,
    justifyContent: "center"
  },

  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  }
});

export default AvailabilitiesHome;