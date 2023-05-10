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

import PeopleList from "../../components/PeopleList";
import Icebreaker from "../../components/Icebreaker";
import TagsList from "../../components/TagsList";
import CircularButton from "../../components/CircularButton";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import Link from "../../components/Link";
import Toggle from "../../components/Toggle";

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

const WhileYouEat = ({ route, navigation }) => {
  // Event details
  const [event, setEvent] = useState(route.params.event);
  const [friend, setFriend] = useState(null); // Display a friend who is also attending the event
  const [host, setHost] = useState(null); // Get the host of the event

  // Data for the attendees
  const [attendees, setAttendees] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  // For tracking opening and closing
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openIcebreakers, setOpenIcebreakers] = useState(false);

  // Get the current user
  const user = auth.currentUser;
  const [groupChat, setGroupChat] = useState(null); // Info for the group chat

  // Fetch meetup data on page load
  useEffect(() => {
    getAttendees();

    db.collection("Users")
      .doc(event.hostID)
      .get()
      .then((doc) => {
        setHost(doc.data());
      });

    db.collection("Users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (friendAttending(doc.data())) {
          db.collection("Users")
            .doc(friendAttending(doc.data()))
            .get()
            .then((doc) => {
              setFriend(doc.data());
            });
        }
      });
  }, []);

  // Checking group chat updates
  useEffect(() => {
    if (event.chatID) {
      db.collection("Groups")
        .doc(event.chatID)
        .onSnapshot((doc) => {
          // Determine unread status
          let unread = false;
          if (doc.data().messages.length > 0) {
            const lastMessage = doc.data().messages[doc.data().messages.length - 1];
            if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
              unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
            }
          }

          const group = {
            groupID: event.chatID,
            uids: doc.data().uids,
            name: doc.data().name,
            messages: doc.data().messages,
            unread: unread
          };

          setGroupChat(group);
        });
    }
  }, [])

  // Adds event to Google Calendar
  const addToCalendar = async () => {
    const details = {
      start: event.startDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
      end: event.endDate.toDate().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
      name: event.name,
      location: event.location,
      additionalInfo: event.additionalInfo
    };

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=
      ${details.name.trim()}&details=${details.additionalInfo}&location=${details.location}
      &dates=${details.start}/${details.end}`;

    Linking.openURL(calendarUrl);
  }

  // Function to navigate to the chat for this event
  const goToEventChat = () => {
    if (event.chatID) {
      navigation.navigate("ChatRoom", {
        group: groupChat
      });
    } else {
      alert("This feature is still in development and will be applied to your future events!")
    }
  };

  // Mark an attendee absent or present
  const markAttendee = (index) => {
    let newAttendees = [...attendees];
    newAttendees[index] = !newAttendees[index];
    setAttendees(newAttendees);

    const storeID = {
      type: event.type,
      id: event.id,
    };

    db.collection("Users")
      .doc(people[index].id)
      .update({
        attendedEventIDs: newAttendees[index]
          ? firebase.firestore.FieldValue.arrayUnion(storeID)
          : firebase.firestore.FieldValue.arrayRemove(storeID),
      });
  };

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

  // Delete the event; this is the old action
  function withdraw() {
    if (!loading) {
      setLoading(true);
      route.params.deleteEvent(event.id);

      const storeID = {
        type: event.type,
        id: event.id,
      };

      db.collection("Users")
        .doc(user.uid)
        .update({
          attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
          attendedEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
        })
        .then(() => {
          if (event.type === "public") {  // Public events
            db.collection("Public Events").doc(event.id).update({
              attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
            })
            .then(() => {
              alert("You withdrew from the meal :(");
              navigation.goBack();
            });
          } else {
            if (event.type === "recommendation") {  // Recommendations
              db.collection("Private Events").doc(event.id).get().then(doc => {
                db.collection("Private Events").doc(event.id).update({
                  attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
                  hostID: doc.data().hostID === user.uid ? "" : doc.data().hostID,
                }).then(() => {
                  alert("You withdrew from the meal :(");
                  navigation.goBack();
                });
              });
            } else {  // Other private events
              db.collection("Private Events").doc(event.id).update({
                attendees: firebase.firestore.FieldValue.arrayRemove(user.uid),
              })
              .then(() => {
                alert("You withdrew from the meal :(");
                navigation.goBack();
              });
            }
          }
        });
    }
  }

  //Reporting event function
  function reportEvent() {
    navigation.navigate("ReportEvent", {
      eventID: event.id,
    });
  }

  // Replace event with new details (for editing)
  const editEvent = (newEvent) => {
    setEvent((event) => ({
      ...event,
      ...newEvent,
    }));
  };

  // Alert the user if they want to withdraw from the event or not
  const withdrawAlert = () => {
    Alert.alert(
      "Withdraw",
      "Are you sure you want to withdraw from this meal?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => withdraw() },
      ],
      { cancelable: false }
    );
  };

  // Determine if a friend is attending the event or not, and return them
  const friendAttending = (userInfo) => {
    let friend = null;
    userInfo.friendIDs.forEach((f) => {
      if (
        event.attendees.includes(f) &&
        f !== event.hostID
      ) {
        friend = f;
        return;
      }
    });

    return friend;
  };

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>{event.name}</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={loading ? "grey" : "black"}
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
                {event.hostID !== user.uid && (
                  <MenuOption
                    onSelect={() => reportEvent()}
                    style={styles.option}
                  >
                    <NormalText size={18}>Report Event</NormalText>
                  </MenuOption>
                )}
                {event.hostID === user.uid && (
                  <MenuOption
                    onSelect={() =>
                      navigation.navigate("InvitePeople", {
                        name: event.name,
                        type: event.type === "public" ? "public" : "private",
                        location: event.location,
                        startDate: event.startDate,
                        endDate: event.endDate,
                        attendees: event.attendees,
                        additionalInfo: event.additionalInfo,
                        hasImage: event.hasImage,
                        image: event.hasImage ? event.image : "",
                        icebreakers: event.ice,
                        id: event.id,
                        from: "WhileYouEat"
                      })
                    }
                    style={styles.option}
                  >
                    <NormalText size={18}>Invite People</NormalText>
                  </MenuOption>
                )}
                {event.hostID === user.uid && (
                  <MenuOption
                    onSelect={() =>
                      navigation.navigate("EditEvent", {
                        event,
                        editEvent,
                        editEvent2: route.params.editEvent,
                      })
                    }
                    style={styles.option}
                  >
                    <NormalText size={18}>Edit Event</NormalText>
                  </MenuOption>
                )}
                <MenuOption
                  onSelect={() => withdrawAlert()}
                  style={styles.option}
                >
                  <NormalText size={18} color="red">
                    Withdraw
                  </NormalText>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        }
      />

      {/* In-event chat button */}
      <View style={styles.eventChat}>
        <CircularButton onPress={() => goToEventChat()}>
          {groupChat && groupChat.unread && <View style={styles.unread}/>}
          <Ionicons name="chatbox-ellipses-outline" size={30} />
        </CircularButton>
      </View>

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
          {event.hostID === user.uid && <NormalText size={12}>❗As host, remember to track attendance below!</NormalText>}
          <LargeText size={24} marginBottom={10}>
            {event.name}
          </LargeText>
          {event.type !== "recommendation" && <TouchableOpacity
            style={styles.row}
            onPress={() => {
              if (host && event.hostID !== user.uid)
                navigation.navigate("FullProfile", {
                  person: host,
                });
            }}
            disabled={event.hostID === user.uid}
          >
            <Image
              source={
                event.hasHostImage
                  ? { uri: event.hostImage }
                  : require("../../../assets/logo.png")
              }
              style={styles.profileImg}
            />
            <MediumText size={18}>
              {event.hostID === user.uid
                ? "You!"
                : event.hostFirstName
                ? event.hostFirstName +
                  " " +
                  event.hostLastName
                : event.hostName}
            </MediumText>
          </TouchableOpacity>}

          <View style={styles.row}>
            <NormalText>
              {event.attendees.length} attendee
              {event.attendees.length !== 1 && "s"}
            </NormalText>
            {friend && <NormalText>, including: </NormalText>}
            {friend && (
              <Image
                source={
                  friend.hasImage
                    ? { uri: friend.image }
                    : require("../../../assets/logo.png")
                }
                style={styles.profileImg}
              />
            )}
            {friend && (
              <NormalText>
                {friend.firstName + " " + friend.lastName.substring(0, 1) + "."}
              </NormalText>
            )}
          </View>
          {event.tags && event.tags.length > 0 && (
            <TagsList marginVertical={10} tags={event.tags} left />
          )}

          {/* 3 event details (location, date, time} are below */}

          <View style={styles.logistics}>
            <View style={styles.row}>
              <Ionicons name="location-sharp" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {event.location}
              </NormalText>
              <Link
                onPress={() =>
                  openMap({ query: event.location, provider: "google" })
                }
              >
                (map)
              </Link>
            </View>

            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {event.startDate ? getDate(event.startDate.toDate()) : getDate(event.date.toDate())}
              </NormalText>
              <Link onPress={() => addToCalendar()}>
                (add to calendar)
              </Link>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} />
              <NormalText paddingHorizontal={10} color="black">
                {event.startDate ? getTime(event.startDate.toDate()) : getTime(event.date.toDate())}
                {event.endDate && " - ".concat(getTime(event.endDate.toDate()))}
              </NormalText>
            </View>
          </View>

          <NormalText marginBottom={20} color="black">
            {event.additionalInfo}
          </NormalText>

          {/* Icebreakers dropdown */}
          <Toggle 
            open={openIcebreakers}
            onPress={() => setOpenIcebreakers(!openIcebreakers)}
            title="Icebreakers"
          />

          <View style={styles.icebreakers}>
            {openIcebreakers &&
              event.ice &&
              event.ice.map((ice, index) => (
                <Icebreaker number={index + 1} icebreaker={ice} key={index} />
              ))}
          </View>

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
                        canEdit={event.hostID === user.uid}
                        attending={attendees[index]}
                        check={() => markAttendee(index)}
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
    height: 150,
    marginBottom: 20,
  },

  icebreakers: {
    textAlign: "left",
    marginBottom: 20,
    paddingHorizontal: 25,
  },

  logistics: {
    marginVertical: 15,
  },

  eventChat: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1,
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

export default WhileYouEat;
