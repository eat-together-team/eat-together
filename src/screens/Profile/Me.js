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
import { AntDesign } from '@expo/vector-icons';

import { compareDates } from "../../utils/methods";

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
        {/* <View style={styles.palette}>
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
          {/* <NormalText style={{color: "white"}}>Background</NormalText>
        </View> */}

        <View style={styles.badge}>
          <WithBadge mealsAttended={mealsAttended} mealsSignedUp={mealsSignedUp}/>
        </View>

        <View style={styles.settings}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="white"
            onPress={() => {
              navigation.navigate("Settings", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          ></Ionicons>
          {/* <NormalText style={{color: "white"}}>Settings</NormalText> */}
        </View>

        <View style={styles.header}>
          <View style={styles.name}>
            <LargeText color="white" marginTop={4} size={24}>{userInfo.firstName + " " + userInfo.lastName}</LargeText>
            <NormalText color="white">@{userInfo.username}</NormalText>
            <NormalText color="white" marginBottom={2}>🏫 {userInfo.school ? userInfo.school : "UW Seattle"}</NormalText>
            <NormalText color="white" marginBottom={2}>
              🍽️ {mealsAttended + "/" + mealsSignedUp + " meals attended"}
            </NormalText>
            <NormalText color="white">Joined in {userInfo.join ? userInfo.join : "June 2024"}</NormalText>

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
              {/* <Ionicons name="list-circle" size={20} color="#4C6FB1" /> */}
              <NormalText color="white" align="left" weight="bold" marginTop={24}>{userInfo.connections} Connections</NormalText>
            </TouchableOpacity>
          </View>

          <Image
            style={styles.image}
            source={
              userInfo.hasImage
                ? { uri: userInfo.image }
                : require("../../../assets/logo.png")
            }
          />
        </View>

        {/* add back connections when navigation succcessfully configured */}
        <View style={styles.links}>
          {/* <TouchableOpacity
            style={styles.link}
            onPress={() => {
              navigation.navigate("Connections", {
                user: userInfo,
                image: userInfo.image,
                updateInfo,
              });
            }}
          >
            {/* <Ionicons name="list-circle" size={20} color="#4C6FB1" /> 
            <NormalText color="white" align="left" weight="bold" marginBottom={20}>{userInfo.connections} Connections</NormalText>
          </TouchableOpacity> */}
        </View>

        <View style={styles.links}>
          <TouchableOpacity
            style={styles.profile}
            onPress={() => {
              navigation.navigate("Edit", {
                user: userInfo,
                updateInfo,
              });
            }}
          >
            {/* <Feather name="edit-2" size={20} color="#4C6FB1" /> */}
            <NormalText color="white" center weight="bold"> Edit profile</NormalText>
          </TouchableOpacity>
        </View>


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
    height: 300,
  },

  image: {
    width: 150,
    height: 150,
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 100,
    backgroundColor: "white",
    // marginTop: 24,
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  name: {
    flex: 1,
    marginRight: 20,
    marginVertical: 20,
    alignItems: "flex-start",
  },

  profile: {
    fontSize: 13,
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    paddingBottom: 12,
    paddingTop: 12,
    width: "95%",
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
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
  },
});
