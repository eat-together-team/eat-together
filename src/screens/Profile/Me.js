import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert
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
// Add buddy button
import Button from "../../components/Button";
import SmallText from "../../components/SmallText";
import Link from "../../components/Link";
import SmallButton from "../../components/SmallButton";
import { AntDesign } from '@expo/vector-icons';

import { compareDates } from "../../utils/methods";

export default function ({ navigation }) {
  const user = auth.currentUser;

  const [userInfo, setUserInfo] = useState({});
  const [banner, setBanner] = useState({});
  const [mealsAttended, setMealsAttended] = useState(0);
  const [mealsSignedUp, setMealsSignedUp] = useState(0);
  const [modalVisible, setModalVisible] = useState(0); // added modal for buddy card

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
                data.type = e.type;
                newEvents.push(data);
                eventsLength--;

                if (eventsLength === 0) {
                  // Sort events by date
                  newEvents = newEvents.sort((a, b) => {
                    return -compareDates(a, b);
                  });

                  setEvents(newEvents);
                }
              }).catch(e => {
                // Still activates after logout for some accounts, commented for now
                // alert("There was an error fetching some of your meals :( try again later");

                eventsLength--;
                newEvents = newEvents.sort((a, b) => {
                  return -compareDates(a, b);
                });

                setEvents(newEvents);
              });
          });
        });
    }

    fetchData();
  }, []);

  // For selecting a photo
  const handleChoosePhoto = async () => {
      Alert.alert (
          "Pick Image",
          "Choose an image for your profile",
          [
              {
                  text: "Gallery",
                  onPress: () => galleryImageSelector(),
              },
              { text: "Take a photo", onPress: () => cameraImageSelector() },
          ],
          { cancelable: false}
      );
  };

  // For selecting a photo from gallery
  const galleryImageSelector = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
    });
    if (!result.cancelled) {
        setPhoto(result.assets[0].uri);
    }
  };

  // For selecting a photo by capturing an image with camera
  const cameraImageSelector = async () => {
      try {
          await ImagePicker.requestCameraPermissionsAsync({});
          let result = await ImagePicker.launchCameraAsync({
              cameraType: ImagePicker.CameraType.back,
              allowsEditing: true,
              quality: 1,
          });
          if (!result.cancelled) {
              setPhoto(result.assets[0].uri);
          }
      } catch (error) {
          alert("Error uploading message: " + error.message);
      }
  };

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
          <NormalText style={{color: "white"}}>Background</NormalText>
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
          <NormalText style={{color: "white"}}>Settings</NormalText>
        </View>
        <Image
          style={styles.image}
          source={
            userInfo.hasImage
              ? { uri: userInfo.image }
              : require("../../../assets/logo.png")
          }
        />

        <View style={styles.links}>

          {/* add back connections when navigation succcessfully configured */}
          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              navigation.navigate("Connections", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          >
            <Ionicons name="list-circle" size={20} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Connections</NormalText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              navigation.navigate("BuddyPage", {
                user: userInfo,
              });
            }}
          >
            <Ionicons name="person-add-sharp" size={20} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Find a Buddy</NormalText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              navigation.navigate("Edit", {
                user: userInfo,
                updateInfo,
              });
            }}
          >
            <Feather name="edit-2" size={20} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Edit Profile</NormalText>
          </TouchableOpacity>

        </View>

        <View style={styles.name}>
          <LargeText size={24}>{userInfo.firstName + " " + userInfo.lastName + " (" + userInfo.pronouns + ")"}</LargeText>
          <MediumText>@{userInfo.username}</MediumText>
          <NormalText>
            🍽️ {mealsAttended + "/" + mealsSignedUp + " meals attended"}
          </NormalText>
          <NormalText marginBottom={5}>🏫 {userInfo.school ? userInfo.school : "UW-Seattle"}</NormalText>
        </View>

        {/*<View style = {styles.link}>
          <TouchableOpacity
            style ={styles.link}
            onPress={() => {
              navigation.navigate("BuddyPage");
            }}>
            <NormalText>You do not have a buddy</NormalText>
              <AntDesign name="adduser" size={24} color="#4C6FB1" />
            <NormalText color="#4C6FB1"> Find a Buddy</NormalText>
          </TouchableOpacity>
        </View>*/}

        <SmallButton
          onPress={() => navigation.navigate("SendBuddyRequest", { user: userInfo })}
        >
          Connect
        </SmallButton>

        <TagsList tags={userInfo.tags ? userInfo.tags : []} />
        <MediumText center>{userInfo.bio}</MediumText>
        {events.length > 0 && <View style={styles.eventRecordBackground}>
          <LargeText>Archives</LargeText>
          <View style={styles.cards}>
            {
              events.map((event) => (
                <EventCard
                  event={event}
                  key={event.id}
                  click={() => {
                    navigation.navigate("FullCard", { event });
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
    alignItems: "center",
  },

  badge: {
    position: "absolute",
    left: 20,
    top: 70,
    marginTop: 10,
  },

  settings: {
    position: "absolute",
    right: 20,
    top: 20,
    alignItems: "center",
  },

  calendar: {
    position: "absolute",
    right: 20,
    top: 70,
  },

  links: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
  },
});
