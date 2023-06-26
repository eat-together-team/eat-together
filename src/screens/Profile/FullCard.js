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

import getDate from "../../getDate";
import getTime from "../../getTime";

import { auth } from "../../provider/Firebase";
import openMap from "react-native-open-maps";

const FullCard = ({ route, navigation }) => {
  const user = auth.currentUser;

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
            <TagsList marginVertical={20} tags={route.params.event.tags} left/>}

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