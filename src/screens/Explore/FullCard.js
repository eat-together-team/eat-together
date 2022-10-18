// Full event page

import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, ImageBackground, Dimensions, Image, TouchableOpacity } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import Button from "../../components/Button";
import TagsList from "../../components/TagsList";
import Link from "../../components/Link";

import getDate from "../../getDate";
import getTime from "../../getTime";

import {db, auth} from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import openMap from "react-native-open-maps";
import {Menu, MenuOption, MenuOptions, MenuTrigger} from "react-native-popup-menu";

const FullCard = ({ route, navigation }) => {
  const user = auth.currentUser;

  const [friend, setFriend] = useState(null); // Display a friend who is also attending the event
  const [attending, setAttending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState(null);

  useEffect(() => {
    db.collection("Users").doc(user.uid).get().then(doc => {
      const events = doc.data().attendingEventIDs.map(e => e.id);

      if (events.includes(route.params.event.id)) {
        setAttending(true);
      }

      if (friendAttending(doc.data())) {
        db.collection("Users").doc(friendAttending(doc.data())).get().then(doc => {
          setFriend(doc.data());
        });
      }
    }).then(() => {
      db.collection("Users").doc(route.params.event.hostID).get().then(doc => {
        setHost(doc.data());
      });
    }).then(() => {
      setLoading(false);
    });
  }, []);

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
        navigation.navigate("Home");
        alert("You are signed up! Click on this event from your homepage to chat with other attendees, find icebreakers, and more.");
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
        rightContent={
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
          
          <TouchableOpacity style={styles.row} onPress={() =>{
            if(host) navigation.navigate("FullProfile", {
              person: host
            })
          }}>
            <Image source={route.params.event.hasHostImage ? { uri: route.params.event.hostImage}
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
            {friend && <NormalText>{friend.firstName + " " + friend.lastName}</NormalText>}
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
                {getDate(route.params.event.date.toDate())}
              </NormalText>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {getTime(route.params.event.date.toDate())}
              </NormalText>
            </View>
          </View>

          <NormalText marginBottom={20} color="black">
            {route.params.event.additionalInfo}
          </NormalText>

          <Button onPress={attending ? withdraw : attend} disabled={route.params.event.hostID === user.uid}
            marginVertical={20} backgroundColor={loading ? "grey" : attending && 
              route.params.event.hostID !== user.uid ? "red" : false}>
              {loading ? "Loading ..." : route.params.event.hostID === user.uid ? "Your event :)" :
                attending ? "Withdraw :(" : "Attend!"}
          </Button>
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