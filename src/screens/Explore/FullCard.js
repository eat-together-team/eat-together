// Full event page

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";

import Toggle from "../../components/Toggle";
import Button from "../../components/Button";
import TagsList from "../../components/TagsList";
import Link from "../../components/Link";
import PeopleList from "../../components/PeopleList";

import getDate from "../../getDate";
import getTime from "../../getTime";

import {db, auth} from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import openMap from "react-native-open-maps";
import {Menu, MenuOption, MenuOptions, MenuTrigger} from "react-native-popup-menu";

const FullCard = ({ route, navigation }) => {
  const user = auth.currentUser;
  const tryoutId = 'knVtYe1mtpaZ9D8XLDrS7FCImtm2'; // ID of test user

  const [friend, setFriend] = useState(null); // Display a friend who is also attending the event
  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState(null);

  // See all attendees
  const [people, setPeople] = useState([]);
  const [openAttendance, setOpenAttendance] = useState(false);

  useEffect(() => {
    db.collection("Users").doc(user.uid).get().then(doc => {
      const events = doc.data().attendingEventIDs.map(e => e.id);

      if (events.includes(route.params.event.id)) {
        setAttending(true);
      }
      
      const friend = friendAttending(doc.data());
      if (friend) {
        db.collection("Users").doc(friend).get().then(doc => {
          setFriend(doc.data());
        });
      }
    }).then(() => {
      db.collection("Users").doc(route.params.event.hostID).get().then(doc => {
        setHost(doc.data());
      });
    }).then(() => {
      getAttendees();
    }).then(() => {
      setLoading(false);
    });
  }, []);

  // Fetch all attendees of this event
  const getAttendees = () => {
    route.params.event.attendees.forEach((attendee) => {
      if (attendee !== user.uid) {
        db.collection("Users")
          .doc(attendee)
          .get()
          .then((doc) => {
            if (doc.exists) {
              setPeople((people) => [...people, doc.data()]);
            }
          });
      }
    });
  };

  // Adds event to Google Calendar
  const addToCalendar = async () => {
    const details = {
      start: route.params.event.startDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
      end: route.params.event.endDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
      name: route.params.event.name,
      location: route.params.event.location,
      additionalInfo: route.params.event.additionalInfo
    };

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=
      ${details.name.trim()}&details=${details.additionalInfo}&location=${details.location}
      &dates=${details.start}/${details.end}`;

    Linking.openURL(calendarUrl);
  }

  // Attend an event
  const attend = () => {
    const storeID = {
      type: "public",
      id: route.params.event.id
    };

    db.collection("Users").doc(user.uid).update({
      attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID)
    }).then(() => {
      db.collection("Public Events").doc(route.params.event.id).update({
        attendees: firebase.firestore.FieldValue.arrayUnion(user.uid)
      }).then(() => {
        navigation.goBack();
        alert("You are signed up :)");
      });
    });
  }

  // Withdraw from an event you initially attended
  const withdraw = () => {
    const storeID = {
      type: "public",
      id: route.params.event.id
    };

    db.collection("Users").doc(user.uid).update({
      attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID)
    }).then(() => {
      db.collection("Public Events").doc(route.params.event.id).update({
        attendees: firebase.firestore.FieldValue.arrayRemove(user.uid)
      }).then(() => {
        navigation.goBack();
        alert("You withdrew :(");
      });
    });
  }

  // Report an event that the user feels is offensive in some way
  //Reporting event function
  function reportEvent() {
    navigation.navigate("ReportEvent", {
      eventID: route.params.event.id,
    });
  }

  // Determine if a friend is attending the event or not, and return them
  const friendAttending = (userInfo) => {
    let friend = null;
    userInfo.friendIDs.forEach(f => {
      if (route.params.event.attendees.includes(f) && f !== route.params.event.hostID) {
        friend = f;
        return;
      }
    });

    return friend;
  }

  return (
    <Layout>
      <TopNav
        middleContent={
          <MediumText center>View Event</MediumText>
        }
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
        rightContent={user.uid !== tryoutId &&
          <View>
            <Menu>
              <MenuTrigger>
                <Ionicons
                    name="ellipsis-horizontal"
                    color={loading ? "grey" : "black"}
                    size={25}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => reportEvent()}  style={styles.option}>
                  <NormalText size={18} color="red">
                    Report
                  </NormalText>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        }
      />
      
      <ScrollView>
        <ImageBackground
          source={
            route.params.event.hasImage
              ? { uri: route.params.event.image }
              : require("../../../assets/foodBackground.png")
          }
          style={styles.imageBackground}
          resizeMode="cover"
        ></ImageBackground>
        <View style={styles.infoContainer}>
          <LargeText size={24} marginBottom={10}>
            {route.params.event.name}
          </LargeText>
          
          <TouchableOpacity style={styles.row}
            onPress={() => {
              if (host && route.params.event.hostID !== user.uid)
                navigation.navigate("FullProfile", {
                  person: host,
                });
            }}
            disabled={route.params.event.hostID === user.uid}>
            <Image source={route.params.event.hasHostImage ? { uri: route.params.event.hostImage }
              : require("../../../assets/logo.png")} style={styles.profileImg}/>
            <MediumText size={18}>{route.params.event.hostID === user.uid ? "You!"
              : (route.params.event.hostFirstName ?
                route.params.event.hostFirstName + " " + route.params.event.hostLastName
              : route.params.event.hostName)}
            </MediumText>
          </TouchableOpacity>
          
          <View style={styles.row}>
            <NormalText>{route.params.event.attendees.length} attendee{route.params.event.attendees.length !== 1 && "s"}</NormalText>
            {friend && <NormalText>, including: </NormalText>}
            {friend && <Image source={friend.hasImage ? { uri: friend.image } : require("../../../assets/logo.png")} style={styles.profileImg}/>}
            {friend && <NormalText>{friend.firstName + " " + friend.lastName.substring(0, 1) + "."}</NormalText>}
          </View>
          {route.params.event.tags && route.params.event.tags.length > 0 &&
            <TagsList marginVertical={10} tags={route.params.event.tags} left/>}

          {/* 3 event details (location, date, time} are below */}

          <View style={styles.logistics}>
            <View style={styles.row}>
              <Ionicons name="location-sharp" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {route.params.event.location}
              </NormalText>
              <Link onPress={() => openMap({ query: route.params.event.location, provider: "google" })}>
                (view on map)
              </Link>
            </View>

            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {route.params.event.startDate ? getDate(route.params.event.startDate.toDate()) : getDate(route.params.event.date.toDate())}
              </NormalText>
              <Link onPress={() => addToCalendar()}>
                (add to calendar)
              </Link>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {route.params.event.startDate ? getTime(route.params.event.startDate.toDate()) : getTime(route.params.event.date.toDate())}
                {route.params.event.endDate && " - ".concat(getTime(route.params.event.endDate.toDate()))}
              </NormalText>
            </View>
          </View>

          <NormalText marginBottom={20} color="black">
            {route.params.event.additionalInfo}
          </NormalText>

          {/* Attendance dropdown */}
          {user.uid !== tryoutId && <Toggle 
            open={openAttendance}
            onPress={() => setOpenAttendance(!openAttendance)}
            title="Attendance"
          />}

          {openAttendance && (
            <View style={{ marginTop: 10 }}>
              {people.length === 0 ? (
                <NormalText paddingHorizontal={25} size={17} color="black">
                  {"Just yourself"}
                </NormalText>
              ) : (
                people.map(person => {
                  if (person.id !== user.uid) {
                    return (
                      <PeopleList
                        person={person}
                        key={person.id}
                        color="white"
                        width="100%"
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
          )}

          {user.uid !== tryoutId && (          
            <Button onPress={attending ? withdraw : attend} disabled={route.params.event.hostID === user.uid}
              marginVertical={20} backgroundColor={loading ? "grey" : attending && 
                route.params.event.hostID !== user.uid ? "red" : false}>
                {loading ? "Loading ..." : route.params.event.hostID === user.uid ? "Your event :)" :
                  attending ? "Withdraw :(" : "Attend!"}
            </Button>)}
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 30,
    marginBottom: 50
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    flexWrap: "wrap"
  },

  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#5DB075",
    borderWidth: 1,
    backgroundColor: "white",
    marginRight: 3
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center"
  },

  imageBackground: {
    width: Dimensions.get("screen").width,
    height: 150,
    marginBottom: 20,
  },

  logistics: {
    marginVertical: 15,
  },
});

export default FullCard;