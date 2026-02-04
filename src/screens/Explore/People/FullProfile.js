//Functionality TDB, most likely to be used to implement ice-breaker games

import React, { useEffect, useState } from "react";
import { serverTimestamp } from "firebase/firestore";
import {
  View,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Platform
} from "react-native";
import { Layout } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import TagsList from "../../../components/TagsList";
import Button from "../../../components/Button";
import EventCard from "../../../components/EventCard";
import NormalText from "../../../components/NormalText";
import FunFact from "../../../components/FunFact";
import GalleryRow from "../../../components/GalleryRow";
import EventsRow from "../../../components/EventsRow";
// import WithBadge from "../../../components/WithBadge";

import { db, auth } from "../../../provider/Firebase";
import firebase from "firebase/compat";
import { tryoutId } from "../../../utils/constants";
import { removeFriend } from "../../../utils/methods";

const blockPerson = (uid, navigation, back) => {
  Alert.alert("Block", "Are you sure you want to block this user? This can't be undone.", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Yes", style: "destructive", onPress: () => databaseStoreBlockAction(uid, navigation, back) },
  ]);
};

const databaseStoreBlockAction = (uid, navigation, back) => {
  alert("This user has been blocked.");
  const user = auth.currentUser;

  // Update user's blacklist & remove from friends
  db.collection("Users")
    .doc(user.uid)
    .update({
      blockedIDs: firebase.firestore.FieldValue.arrayUnion(uid),
      friendIDs: firebase.firestore.FieldValue.arrayRemove(uid),
    });

  // Same thing for other user
  db.collection("Users")
    .doc(uid)
    .update({
      blockedIDs: firebase.firestore.FieldValue.arrayUnion(user.uid),
      friendIDs: firebase.firestore.FieldValue.arrayRemove(user.uid),
    });

  // Remove all chats with this user
  db.collection("Groups")
    .where("uids", "array-contains", user.uid)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        if (doc.data().uids.includes(uid)) {
          db.collection("Users")
            .doc(user.uid)
            .update({
              groupIDs: firebase.firestore.FieldValue.arrayRemove(doc.id),
            });

          if (doc.data().uids.length === 2) { // If it's just a 1:1 chat, delete it
            db.collection("Users")
              .doc(uid)
              .update({
                groupIDs: firebase.firestore.FieldValue.arrayRemove(doc.id),
              });

            db.collection("Groups").doc(doc.id).delete();
          } else {
            db.collection("Groups")
            .doc(doc.id)
            .update({
              uids: firebase.firestore.FieldValue.arrayRemove(user.uid),
            });
          }
        }
      });
    });

  navigation.navigate(back);
};

const FullProfile = ({ blockBack, route, navigation }) => {
  const user = auth.currentUser; // Current user

  // Safely destructure person with fallbacks
  const person = route?.params?.person || {};

  person.attendedEventIDs = person.attendedEventIDs || [];
  person.archivedEventIDs = person.archivedEventIDs || [];
  person.attendingEventIDs = person.attendingEventIDs || [];
  person.settings = person.settings || { banner: "#5DB075" };
  person.bio = person.bio || "";
  person.tags = person.tags || [];
  person.school = person.school || "UW-Seattle";
  person.pronouns = person.pronouns || "";


  const [status, setStatus] = useState("Loading"); // Status of connection
  const [disabled, setDisabled] = useState(true); // Disable button if already connected
  const [color, setColor] = useState("grey"); // Color of button
  const [events, setEvents] = useState([]); // Events that this user has hosted
  const [inviterImage, setInviterImage] = useState(
    "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png"
  );
  const [personData, setPersonData] = useState(person);
  const [followButtonLayout, setFollowButtonLayout] = useState({ y: 0, height: 0 });
  const [joinDate, setJoinDate] = useState(null);

  const reportPerson = () => {
    navigation.navigate("ReportPerson", {
      user: person,
    });
  };

  useEffect(() => {
    // updates stuff right after React makes changes to the DOM
    // STEP 1: Check if user is on your connections list.
    let thisUser = db.collection("Users").doc(user.uid);
    thisUser
      .get()
      .then((doc) => {
        let thisData = doc.data();
        // Save some images
        if (thisData.hasImage) {
          setInviterImage(thisData.image);
        }

        let requestedUser = db.collection("Users").doc(person.id);

        requestedUser.get().then((doc) => {
          let data = doc.data();
          // Update personData with fetched data including hasImage and image
          setPersonData(prev => ({
            ...prev,
            ...data,
            hasImage: data.hasImage || false,
            image: data.image || ""
          }));

          if (thisData.friendIDs.includes(data.id)) {
            setDisabled(true);
            setStatus("Connections");
            setColor("gold");
          } else {
            // STEP 2: Check if you have already requested to connect with user.
            const ref = db
              .collection("User Invites")
              .doc(data.id)
              .collection("Connections")
              .doc(user.uid);
            ref.get().then((doc) => {
              if (doc.exists) {
                setDisabled(true);
                setStatus("Request Sent");
                setColor("grey");
              } else {
                // STEP 3: Check if user has already requested to follow you.
                const otherRef = db
                  .collection("User Invites")
                  .doc(user.uid)
                  .collection("Connections")
                  .doc(data.id);
                otherRef.get().then((doc) => {
                  if (doc.exists) {
                    setDisabled(true);
                    setStatus("Check Requests");
                    setColor("orange");
                  } else {
                    // STEP 4: Set to default
                    setDisabled(false);
                    setStatus("Follow");
                    setColor("#5DB075");
                  }
                });
              }
            });
          }
        });
      })
      .then(() => {
        let list = [];
        db.collection("Public Events").onSnapshot((query) => {
          query.forEach((doc) => {
            if (
              doc.data().hostID === person.id &&
              (doc.data().endDate ? doc.data().endDate.toDate() : doc.data().date.toDate() > new Date() > new Date())
            ) {
              list.push(doc.data());
            }
          });

          list.reverse();
          setEvents(list);
        });
      });
  }, []);

  // Method for sending a connection request
  const connect = () => {
    let requestedUser = db
      .collection("Usernames")
      .doc(person.username);
    requestedUser.get().then((doc) => {
      let data = doc.data();
      db.collection("Users")
        .doc(user.uid)
        .get()
        .then((curUser) => {
          let userData = curUser.data();
          db.collection("User Invites")
            .doc(data.id)
            .collection("Connections")
            .doc(user.uid)
            .set({
              name: userData.firstName + " " + userData.lastName,
              username: userData.username,
              profile: inviterImage,
              sentAt: Date.now()
            })
            .then(() => {
              setStatus("Request Sent");
              setDisabled(true);
              setColor("grey");
            });
        });
    });
  };

  const statusBarHeight = Constants.statusBarHeight || (Platform.OS === 'ios' ? 44 : 24);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* if a user has a set profile picture, blur it and set it as their background
        if they don't set their background to the default eat together green*/}
        <View style={styles.backgroundContainer}>
          {personData.hasImage && personData.image ? (
            <ImageBackground
              source={{ uri: personData.image }}
              style={[
                styles.background,
                {
                  height:
                    Math.max(320, followButtonLayout.y + followButtonLayout.height + 10) +
                    statusBarHeight - 35 + (Platform.OS === 'android' ? 16 : 0),
                },
              ]}
              imageStyle={styles.backgroundImage}
              blurRadius={20}
            />
          ) : (
            <View
              style={[
                styles.background,
                {
                  backgroundColor: "#5DB075",
                  height:
                    Math.max(360, followButtonLayout.y + followButtonLayout.height) +
                    statusBarHeight - 25 + (Platform.OS === 'android' ? 16 : 0),
                },
              ]}
            />
          )}
        </View>
        <View style={[styles.page, { paddingTop: statusBarHeight + 100 }]}>
        <View style={[styles.palette, { top: statusBarHeight + (Platform.OS === 'android' ? 10 : 20) }]}>
          <Ionicons
            name="arrow-back-sharp"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
        </View>

        {/* <View style={styles.badge}>
          <WithBadge
            mealsAttended={person.attendedEventIDs.length}
            mealsSignedUp={person.archivedEventIDs.length +
              person.attendingEventIDs.length}/>
        </View> */}

        <View style={styles.header}>
          <View style={styles.name}>
            <LargeText color="white" marginTop={4} size={((person.firstName || '') + ' ' + (person.lastName || '')).trim().length > 18 ? 18 : 24}>
              {person.firstName + " " + person.lastName}
            </LargeText>
            <NormalText color="white" weight="bold" marginBottom={10}>@{person.username}</NormalText>

            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white" marginBottom={2}>{person.school ? person.school : "UW-Seattle"}</NormalText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white" marginBottom={2}>
                {person.attendedEventIDs.length + "/" + (person.archivedEventIDs.length + person.attendingEventIDs.length) + " meals attended"}
              </NormalText>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="white" style={styles.infoIcon} />
              <NormalText color="white">Joined {person.join || "June 2024"}</NormalText>
            </View>
          </View>

          <Image
            style={styles.image}
            source={
              person.hasImage
                ? { uri: person.image }
                : require("../../../../assets/logo.png")
            }
          />
        </View>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.connections}
            onPress={() =>
              navigation.navigate("Connections", {
                viewingUser: { id: person.id, firstName: person.firstName, lastName: person.lastName },
                returnPerson: person,
              })
            }
          >
            <NormalText color="white" align="left" weight="bold" marginTop={8} marginBottom={8}>
              {(personData.friendIDs || person.friendIDs || []).length} Connections
            </NormalText>
          </TouchableOpacity>
        </View>

        {tryoutId != user.uid && (
          <View 
            style={styles.links}
            onLayout={(event) => {
              const { y, height } = event.nativeEvent.layout;
              setFollowButtonLayout({ y, height });
            }}
          >
            <TouchableOpacity
              style={[styles.followButton, { backgroundColor: "white"}]}
              onPress={connect}
              disabled={disabled}
            >
              <NormalText color="black" center weight="bold">{status}</NormalText>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 50 }}>
          <TagsList tags={person.tags} filterType="food" />
          <TagsList tags={person.tags} filterType="hobby" />
          <FunFact text={person.bio} />
          <TagsList tags={person.tags} filterType="school" />
        </View>

        {/* gallery */}
        {personData.gallery && personData.gallery.length > 0 && (
          <View style={styles.galleryBackground}>
            <View style={styles.galleryHeader}>
              <NormalText>Gallery</NormalText>
              <TouchableOpacity onPress={() => navigation.navigate("Gallery", { userId: person.id, userName: person.firstName + " " + person.lastName })}>
                <NormalText color="grey">View all</NormalText>
              </TouchableOpacity>
            </View>
            <GalleryRow images={personData.gallery || []} />
          </View>
        )}

        {/* events */}
        {events.length > 0 && (
          <View style={styles.eventRecordBackground} marginTop={10}>
            <View style={styles.eventsHeader}>
              <NormalText>Meetup Archive</NormalText>
              <TouchableOpacity>
                <NormalText color="grey">View all</NormalText>
              </TouchableOpacity>
            </View>
            <EventsRow 
              events={events} 
              onEventPress={(event) => {
                navigation.navigate("FullCard", {
                  event,
                });
              }}
            />
          </View>
        )}

        {tryoutId != user.uid && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={() => blockPerson(person.id, navigation, blockBack)}
            >
              <NormalText color="red" weight="bold">Block</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={reportPerson}
            >
              <NormalText color="#797979" weight="bold">Report</NormalText>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: Dimensions.get("window").width,
  },
  page: {
    alignItems: "center",
    paddingHorizontal: 10,
  },

  background: {
    width: Dimensions.get("window").width,
  },
  backgroundImage: {
    resizeMode: "cover",
  },

  image: {
    width: 150,
    height: 150,
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 100,
    backgroundColor: "white",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -40,
  },

  palette: {
    position: "absolute",
    left: 20,
    alignItems: "center",
  },

  // badge: {
  //   position: "absolute",
  //   left: 20,
  //   top: 80,
  //   marginTop: 10,
  // },

  name: {
    flex: 1,
    marginRight: 20,
    marginTop: 0,
    marginBottom: 20,
    alignItems: "flex-start",
  },

  connections: {
    alignItems: "flex-start",
    paddingTop: 42,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  infoIcon: {
    marginRight: 6,
  },

  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },

  link: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center"
  },

  links: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    paddingHorizontal: 20,
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

  followButton: {
    borderRadius: 10,
    paddingBottom: 12,
    paddingTop: 12,
    width: "95%",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 32,
    marginBottom: 40,
    paddingHorizontal: 20,
  },

  blockButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    minWidth: Platform.OS === "android" ? 150 : 175,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "red",
    borderWidth: 2,
    borderRadius: 10,
    color: "red",
  },

  reportButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    minWidth: Platform.OS === "android" ? 150 : 175,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#797979",
    borderWidth: 2,
    borderRadius: 10,
    color: "#797979",
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 16,
  },

  galleryBackground: {
    width: Dimensions.get("screen").width,
    alignItems: "center",
    paddingTop: 20,
    marginTop: 20,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
  },

  eventRecordBackground: {
    width: Dimensions.get("screen").width,
    alignItems: "center",
  },

  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
});

export default FullProfile;
