// What your event will look like

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
  Linking
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import PlayerList from "../../components/PlayerList";
import Icebreaker from "../../components/Icebreaker";
import TagsList from "../../components/TagsList";
import CircularButton from "../../components/CircularButton";
import RecTutorialMessage from "../../components/RecTutorialMessage";  // Tutorial message for recommendations

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import Link from "../../components/Link";
import Toggle from "../../components/Toggle";
import Button from "../../components/Button";

import getDate from "../../getDate";
import getTime from "../../getTime";
import { db, auth } from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import openMap from "react-native-open-maps";

const StartGame = ({ route, navigation }) => {
  // Event details
  const [event, setEvent] = useState(route.params.event);
  const [friend, setFriend] = useState(null); // Display a friend who is also attending the event
  const [host, setHost] = useState(null); // Get the host of the event

  // Data for the attendees
  const [attendees, setAttendees] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get the current user
  const user = auth.currentUser;

  // Fetch meetup data on page load
  useEffect(() => {
    getAttendees(); // Fetch attendees

    // Fetch host info (not for recommendations)
    if (event.hostID) {
      db.collection("Users")
        .doc(event.hostID)
        .get()
        .then((doc) => {
          setHost(doc.data());
        });
    }
  }, []);

  // Fetch all attendees of this event
  const getAttendees = () => {
    event.attendees.forEach((attendee) => {
      if (attendee !== user.uid) {
        db.collection("Users")
          .doc(attendee)
          .get()
          .then((doc) => {
            const data = doc.data();
            let attended = false;
            const ids = data.attendedEventIDs.map((e) => e.id);

            if (ids.includes(event.id)) {
              attended = true;
            }

            setPeople((people) => [...people, data]);
            setAttendees((attendees) => [...attendees, attended]);
          });
      }
    });
  };

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>Would You Rather?</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={loading ? "grey" : "black"}
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      <ScrollView>
        <ImageBackground
          source={
            event.hasImage
              ? { uri: event.image }
              : require("../../../assets/foodBackground.png")
          }
          style={styles.imageBackground}
          resizeMode="cover"
        ></ImageBackground>

        <View style={styles.infoContainer}>
          <LargeText size={24} marginBottom={10}>
            Would You Rather?
          </LargeText>

          <View style={styles.row}>
            <MediumText>
              Players
            </MediumText>

          <View style={styles.row}>
              {people.length === 0 ? (
                <NormalText paddingHorizontal={25} size={17} color="black">
                  {"Just yourself"}
                </NormalText>
              ) : (
                people.map((person, index) => {
                  if (person.id !== user.uid) {
                    return (
                      <PlayerList
                        person={person}
                        key={person.id}
                        color="white"
                        width="50%"
                        height="10%"
                        click={() => {
                          navigation.navigate("FullProfile", {
                              person: person
                          });
                        }}
                      />
                    );
                  }
                })
              )}
            </View>

          </View>

          <Button onPress={() => {
            navigation.navigate("StartGame", {
              event: event,
              people: people
            })
          }}>
            Start Game
          </Button>

        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 30,
    marginBottom: 100,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    flexWrap: "wrap",
  },

  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#5DB075",
    borderWidth: 1,
    backgroundColor: "white",
    marginRight: 3,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  imageBackground: {
    width: Dimensions.get("screen").width,
    height: 200,
    marginBottom: 20,
  },

  logistics: {
    marginVertical: 15,
  },


  unread: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "red",
    position: "absolute",
    top: 5,
    right: 5
  }
});

export default StartGame;
