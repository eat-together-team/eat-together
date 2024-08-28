// Full event page

import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Image,
  Linking
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import TagsList from "../../components/TagsList";
import Link from "../../components/Link";
import Toggle from "../../components/Toggle";

import getDate from "../../getDate";
import getTime from "../../getTime";

import { auth } from "../../provider/Firebase";
import openMap from "react-native-open-maps";

import { useState, useEffect } from "react";
import PeopleList from "../../components/PeopleList";
import { db } from "../../provider/Firebase";


const FullCard = ({ route, navigation }) => {
  const user = auth.currentUser;

  const [attendees, setAttendees] = useState([]);
  const [people, setPeople] = useState([]);
  const [openAttendance, setOpenAttendance] = useState(false);

    // Image Carousel
    const [imageGallery, setImageGallery] = useState(["../../../assets/foodBackground.png"]); 
    const numColumns = 3;
    const screenWidth = Dimensions.get("window").width;
    const tileSize = (screenWidth - 2.4 * 5 * numColumns) / numColumns;
    const [loading, setLoading] = useState(false);


  useEffect(() => {
    const event = route.params.event;  // Get the event from route parameters

    if (event.eventGallery) {
      setImageGallery(event.eventGallery);
      setLoading(false);
    }
  
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
  
    getAttendees();
  }, [route.params.event]);  // Re-fetch if the event changes
  
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

  return (
    <Layout>
      <TopNav
        middleContent={
          <MediumText center>View Meal</MediumText>
        }
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
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
          
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={route.params.event.hasHostImage ? { uri: route.params.event.hostImage}
              : require("../../../assets/logo.png")} style={styles.profileImg}/>
            <MediumText size={18}>{route.params.event.hostID === user.uid ? "You!"
              : (route.params.event.hostFirstName ?
                route.params.event.hostFirstName + " " + route.params.event.hostLastName
              : route.params.event.hostName)}
            </MediumText>
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

            <View style={styles.row}>
              <NormalText paddingHorizontal={10}>
                Photo Gallery Preview:
              </NormalText>
            </View>


            <View style={styles.row}>
            <Image
              source={
                imageGallery[0]
                ? { uri: imageGallery[0].imageUrl }
                : require("../../../assets/food.jpg")
              }
              style={{ width: tileSize, height: tileSize, borderRadius: 15, margin:5, blurRadius:15,}}
            />
            <Image
              source={
                imageGallery[1]
                ? { uri: imageGallery[1].imageUrl }
                : require("../../../assets/foodBackground.png")

              }
              blurRadius={2}
              style={{ width: tileSize, height: tileSize, borderRadius: 15, margin:5,}}
            />

            <ImageBackground
              source={
                 require("../../../assets/food.jpg")
              }
              style={{ width: tileSize/2, height: tileSize, margin:5}}
              borderTopLeftRadius={15}
              borderBottomLeftRadius={15}
              blurRadius={10}
            />

            </View>

            <View style={styles.row}>
              <Ionicons name="image-outline"size={20}/>
              <NormalText  paddingHorizontal={10} color="black">
                <Link onPress={() => navigation.navigate("EventGallery",{event:route.params.event})}>Access Meetup Photo Gallery</Link>
              </NormalText>
            </View>
          </View>

          {route.params.event.additionalInfo !== "" && <NormalText marginBottom={20} color="black">
            {route.params.event.additionalInfo}
          </NormalText>}

          {/* Attendance dropdown */}
          <Toggle 
            open={openAttendance}
            onPress={() => setOpenAttendance(!openAttendance)}
            title="Attendance"
          />

          {openAttendance && (
            <View style={{ marginTop: 10 }}>
              {people.length === 0 ? (
                <NormalText paddingHorizontal={25} size={17} color="black">
                  {"Just yourself"}
                </NormalText>
              ) : (
                people.map((person, index) => {
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