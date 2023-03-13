import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Layout } from "react-native-rapi-ui";
import { Ionicons, Feather } from "@expo/vector-icons";
import { db, auth } from "../../provider/Firebase";

import WithBadge from "../../components/WithBadge";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import TagsList from "../../components/TagsList";
import EventCard from "../../components/EventCard";

import { compareDates } from "../../methods";

export default function ({ navigation }) {
  const user = auth.currentUser;

  const [userInfo, setUserInfo] = useState({});
  const [banner, setBanner] = useState({});
  const [mealsAttended, setMealsAttended] = useState(0);
  const [mealsSignedUp, setMealsSignedUp] = useState(0);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      await db
        .collection("Users")
        .doc(user.uid)
        .onSnapshot(async (doc) => {
          if (!doc.exists) {
            return;
          }
          
          setUserInfo(doc.data());
          if (doc.data().settings.banner) {
            setBanner(doc.data().settings.banner);
          } else {
            db.collection("Users").doc(user.uid).update({
              "settings.banner": '#5DB075'
            });
            setBanner('#5DB075')
          }
          setMealsAttended(doc.data().attendedEventIDs.length);
          setMealsSignedUp(
            doc.data().attendingEventIDs.length +
            doc.data().archivedEventIDs.length
          );

          let newEvents = [];
          let eventsLength = doc.data().archivedEventIDs.length;

          doc.data().archivedEventIDs.forEach(async (e) => {
            let table = "Public Events";
            if (e.type === "private") {
              table = "Private Events";
            }

            await db.collection(table)
              .doc(e.id)
              .get()
              .then((event) => {
                let data = event.data();
                newEvents.push(data);
                eventsLength--;

                if (eventsLength === 0) {
                  // Sort events by date
                  newEvents = newEvents.sort((a, b) => {
                    return compareDates(a, b);
                  });

                  setEvents(newEvents);
                }
              }).catch(e => {
                // Still activates after logout for some accounts, commented for now
                //alert("There was an error fetching some of your meals :( try again later");

                eventsLength--;
                newEvents = newEvents.sort((a, b) => {
                  return compareDates(a, b);
                });

                setEvents(newEvents);
              });
          });
        });
    }

    fetchData();
  }, []);

  // Update user profile after editing
  const updateInfo = (newFirstName, newLastName, newPronouns, newBio, newTags, newImage) => {
    setUserInfo((prev) => ({
      ...prev,
      firstName: newFirstName,
      lastName: newLastName,
      pronouns: newPronouns,
      bio: newBio,
      tags: newTags,
      image: newImage,
    }));
  };



  // Update user's availabilities after editing
  const updateAvailabilities = newAvailabilities => {
    setUserInfo(prev => ({
      ...prev,
      availabilities: newAvailabilities
    }));
  }

  // Update user's banner after editing
  const updateBanner = newBanner => {
    setBanner(() => ({
      banner: newBanner
    }));
  }

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.background, {backgroundColor: banner}]} />
        <View style={styles.palette}>
          <Ionicons
            name="aperture"
            size={40}
            color="white"
            onPress={() => {
              navigation.navigate("ColorPicker", {
                oldbanner: banner,
                updateBanner,
              });
            }}
          ></Ionicons>
        </View>
        
        <View style={styles.badge}>
          <WithBadge mealsAttended={mealsAttended} mealsSignedUp={mealsSignedUp}/>
        </View>
        
        <View style={styles.settings}>
          <Ionicons
            name="settings-sharp"
            size={40}
            color="white"
            onPress={() => {
              navigation.navigate("Settings", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          ></Ionicons>
        </View>
        <View style={styles.calendar}>
          <Ionicons
            name="calendar-sharp"
            size={40}
            color="white"
            onPress={() => {
              navigation.navigate("AvailabilitiesHome", {
                user: userInfo,
                updateAvailabilities,
              });
            }}
          ></Ionicons>
        </View>

        <Image
          style={styles.image}
          source={
            userInfo.hasImage
              ? { uri: userInfo.image }
              : require("../../../assets/logo.png")
          }
        />

        <View style={styles.name}>
          <LargeText>{userInfo.firstName + " " + userInfo.lastName}</LargeText>
          <NormalText marginBottom={5}>({userInfo.pronouns})</NormalText>
          <NormalText>
            {mealsAttended + "/" + mealsSignedUp + " meals attended"}
          </NormalText>
          <MediumText>@{userInfo.username}</MediumText>

          <TouchableOpacity
            style={styles.connections}
            onPress={() => {
              navigation.navigate("Connections", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
            marginVertical={10}
          >
            <Ionicons name="list-circle" size={20} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Connections</NormalText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.edit}
            onPress={() => {
              navigation.navigate("Edit", {
                user: userInfo,
                updateInfo,
              });
            }}
            marginVertical={10}
          >
            <Feather name="edit-2" size={20} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Edit Profile</NormalText>
          </TouchableOpacity>
        </View>

        <TagsList tags={userInfo.tags ? userInfo.tags : []} />
        <MediumText center>{userInfo.bio}</MediumText>
        {events.length > 0 && <View style={styles.eventRecordBackground}>
          <LargeText color="white">Archives</LargeText>
          <View style={styles.cards}>
            {
              events.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  click={() => {
                    navigation.navigate("FullCard", {
                      event,
                    });
                  }}
                />
              ))}
          </View>
        </View>}
      </ScrollView>
    </Layout>
  );
}
const styles = StyleSheet.create({
  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },

  eventRecordBackground: {
    backgroundColor: "#808080",
    width: Dimensions.get("screen").width,
    alignItems: "center",
    paddingTop: 20,
    marginTop: 40,
  },

  page: {
    paddingTop: 30,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  background: {
    position: "absolute",
    width: Dimensions.get("screen").width,
    height: 150,
  },

  image: {
    width: 175,
    height: 175,
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 100,
    backgroundColor: "white",
  },

  name: {
    width: "100%",
    marginVertical: 20,
    alignItems: "center",
  },

  palette: {
    position: "absolute",
    left: 20,
    top: 20,
  },

  badge: {
    position: "absolute",
    left: 20,
    top: 70,
  },

  settings: {
    position: "absolute",
    right: 20,
    top: 20,
  },

  calendar: {
    position: "absolute",
    right: 20,
    top: 70,
  },

  connections: {
    position: "absolute",
    left: "2%",
    top: -25,
    flexDirection: "row",
    alignItems: "center",
  },

  edit: {
    position: "absolute",
    right: "2%",
    top: -25,
    flexDirection: "row",
    alignItems: "center",
  },
});
