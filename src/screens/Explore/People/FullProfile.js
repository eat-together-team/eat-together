//Functionality TDB, most likely to be used to implement ice-breaker games

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import TagsList from "../../../components/TagsList";
import Button from "../../../components/Button";
import EventCard from "../../../components/EventCard";
import NormalText from "../../../components/NormalText";
import WithBadge from "../../../components/WithBadge";

import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

import { db, auth } from "../../../provider/Firebase";
import firebase from "firebase/compat";

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
  /*
  Other places this effects:
  -remove from people display
  -can't organize private events with this person
  -remove invites from that person
  -remove connection requests from that person
  */
};

//Remove a friend, if we are already connected with them
function removeFriend(uid, navigation) {
  Alert.alert("Remove Friend", "Are you sure you want to remove this friend?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Yes", style: "destructive" ,onPress: () => databaseRemoveFriend(uid, navigation) },
  ]);
}

function databaseRemoveFriend(uid, navigation) {
  alert("Friend removed.");
  const user = auth.currentUser;

  // update user's blacklist & remove from friends
  db.collection("Users")
      .doc(user.uid)
      .update({
        friendIDs: firebase.firestore.FieldValue.arrayRemove(uid)
      }).then(() => {
        db.collection("Users").doc(uid).update({
          friendIDs: firebase.firestore.FieldValue.arrayRemove(user.uid)
        })
  });
  
  navigation.goBack();
}

const FullProfile = ({ blockBack, route, navigation }) => {
  const user = auth.currentUser; // Current user
  const tryoutId = 'knVtYe1mtpaZ9D8XLDrS7FCImtm2'; // ID of the test user

  const [status, setStatus] = useState("Loading"); // Status of connection
  const [disabled, setDisabled] = useState(true); // Disable button if already connected
  const [color, setColor] = useState("grey"); // Color of button
  const [events, setEvents] = useState([]); // Events that this user has hosted
  const [inviterImage, setInviterImage] = useState(
    "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png"
  );

  const reportPerson = () => {
    navigation.navigate("ReportPerson", {
      user: route.params.person,
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

        let requestedUser = db.collection("Users").doc(route.params.person.id);

        requestedUser.get().then((doc) => {
          let data = doc.data();

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
                    setStatus("Add Connection");
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
              doc.data().hostID === route.params.person.id &&
              (doc.data().endDate ? doc.data().endDate.toDate() : doc.data().date.toDate() > new Date() > new Date())
            ) {
              list.push(doc.data());
            }
          });

          setEvents(list);
        });
      });
  }, []);

  // Method for sending a connection request
  const connect = () => {
    let requestedUser = db
      .collection("Usernames")
      .doc(route.params.person.username);
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
            })
            .then(() => {
              setStatus("Request Sent");
              setDisabled(true);
              setColor("grey");
            });
        });
    });
  };

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>View Profile</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
        rightContent={user.uid !== tryoutId &&
          <View>
            <Menu>
              <MenuTrigger>
                <Ionicons
                  name="ellipsis-horizontal"
                  color={"black"}
                  size={20}
                />
              </MenuTrigger>
              <MenuOptions>
                { status == "Connections" &&
                    <MenuOption onSelect={() => removeFriend(route.params.person.id, navigation)}>
                      <NormalText size={18}>
                        Remove Friend
                      </NormalText>
                    </MenuOption>
                }
                <MenuOption onSelect={() => blockPerson(route.params.person.id, navigation, blockBack)}>
                  <NormalText size={18} color={"red"}>
                    Block
                  </NormalText>
                </MenuOption>
                <MenuOption onSelect={() => reportPerson()}>
                  <NormalText size={18} color={"red"}>
                    Report
                  </NormalText>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.background, {
          backgroundColor: route.params.person.settings.banner ? route.params.person.settings.banner : "#5DB075"
        }]} />

        <View style={styles.badge}>
          <WithBadge
            mealsAttended={route.params.person.attendedEventIDs.length}
            mealsSignedUp={route.params.person.archivedEventIDs.length +
              route.params.person.attendingEventIDs.length}/>
        </View>

        <Image
          style={styles.image}
          source={
            route.params.person.hasImage
              ? { uri: route.params.person.image }
              : require("../../../../assets/logo.png")
          }
        />

        <View style={styles.name}>
          <LargeText>
            {route.params.person.firstName + " " + route.params.person.lastName}
          </LargeText>
          <NormalText marginBottom={5}>({route.params.person.pronouns})</NormalText>
          <MediumText size={16}>@{route.params.person.username}</MediumText>
          {tryoutId != user.uid && (
            <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <Button
              disabled={disabled}
              onPress={connect}
              backgroundColor={color}
              paddingVertical={5}
              paddingHorizontal={15}
              fontSize={14}
            >
              {status}
            </Button>
          </View>
          )}

          <NormalText>
            {route.params.person.attendedEventIDs.length +
              "/" +
              (route.params.person.archivedEventIDs.length +
                route.params.person.attendingEventIDs.length) +
              " meals attended"}
          </NormalText>
        </View>

        <TagsList tags={route.params.person.tags} />
        <MediumText>{route.params.person.bio}</MediumText>
        <View style={styles.cards}>
          {events.map((event) => (
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
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  background: {
    position: "absolute",
    width: Dimensions.get("screen").width,
    height: 100
  },

  image: {
    width: 125,
    height: 125,
    borderColor: "white",
    borderWidth: 3,
    borderRadius: 125,
    backgroundColor: "white",
  },

  badge: {
    position: "absolute",
    left: 20,
    top: 20,
  },

  name: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
});

export default FullProfile;
