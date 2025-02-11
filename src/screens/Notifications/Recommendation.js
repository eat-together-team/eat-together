// Full recommendation page

import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Image, TouchableOpacity, Linking } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";

import Container from "../../components/Container";
import Button from "../../components/Button";
import BorderedButton from "../../components/BorderedButton";
import TagsList from "../../components/TagsList";
import Link from "../../components/Link";
import Toggle from "../../components/Toggle";
import CircularButton from "../../components/CircularButton";
import RecTutorialMessage from "../../components/RecTutorialMessage";  // Tutorial message for recommendations

import getDate from "../../getDate";
import getTime from "../../getTime";

import {db, auth} from "../../provider/Firebase";
import * as firebase from "firebase/compat";
import openMap from "react-native-open-maps";
import { getCommonTags } from "../../methods";
import moment from 'moment';

import RBSheet from "react-native-raw-bottom-sheet";
import Checkbox from "../../components/Checkbox";
const Recommendation = ({ route, navigation }) => {
  // User and other user states
  const user = auth.currentUser;
  const [groupChat, setGroupChat] = useState(null); // Info for the group chat
  const [attendees, setAttendees] = useState([]);
  const [commonTags, setCommonTags] = useState([]); // Common tags between the user and others
  const [isAttending, setIsAttending] = useState(false); // Whether the user has accepted the invite or not

  const [openMenu, setOpenMenu] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for the button

  const [recSteps, setRecSteps] =  useState(0); // Tutorial steps for recommendations

  const [attendingTutorial, setAttendingTutorial] = useState(true);  // State to see if we should show the attending an event tutorial
  const [isDataFetched, setIsDataFetched] = useState(false);  // State to track whether data has been fetched

  const showTimeFilterRef = useRef();
  const [monday, setMonday] = useState(false);
  const [tuesday, setTuesday] = useState(false);
  const [wednesday, setWednesday] = useState(false);
  const [thursday,setThursday] = useState(false);
  const [dayChosen, setDayChosen] = useState(false);
  const [startDate,setStartDate] = useState(route.params.event.startDate.toDate());
  const [endDate, setEndDate] = useState(route.params.event.endDate.toDate());
  const [maxVote, setMaxVote] = useState();
  useEffect(() => {
    let existingTags = {}; // To avoid duplicates
    // Loads the tags of all the attendees
    route.params.event.suggestedAttendees.forEach(attendee => {
      if (attendee !== user.uid) {
        db.collection("Users").doc(attendee).get().then(doc => {
          setAttendees(prev => [...prev, doc.data()]);
          // Find tags that are in common between users
          const tags = getCommonTags(route.params.userData, doc.data());
          let newTags = [];
          tags.forEach(tag => {
            if (!existingTags[tag.tag]) {
              existingTags[tag.tag] = true;
              newTags.push(tag);
            }
          });

          setCommonTags(prev => prev.concat(newTags));
        });
      }
    });

    // Check if the user is attending the event
    const eventIDs = route.params.userData.attendingEventIDs.map(event => event.id);
    setIsAttending(eventIDs.includes(route.params.event.id));
    setLoading(false);
  }, []);

  // Checking group chat updates
  useEffect(() => {
    if (route.params.event.chatID) {
      db.collection("Groups")
        .doc(route.params.event.chatID)
        .onSnapshot((doc) => {
          // Determine unread status
          let unread = false;
          if (doc.data().messages.length > 0) {
            const lastMessage = doc.data().messages[doc.data().messages.length - 1];
            if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
              const unread_exists = lastMessage.unread.filter(u => u.uid === user.uid);
              if (unread_exists.length !== 0) {
                unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
              } else {
                unread = false;
              }
            }
          }

          const group = {
            groupID: route.params.event.chatID,
            uids: doc.data().uids,
            name: doc.data().name,
            messages: doc.data().messages,
            unread: unread
          };

          setGroupChat(group);
        });
    }
  }, [])

  // Confirm attendance to recommended meetup
  const attend = () => {
    setLoading(true);
    const storeID = {
      type: "recommendation",
      id: route.params.event.id
    };


    db.collection("Private Events").doc(route.params.event.id).update({
      attendees: firebase.firestore.FieldValue.arrayUnion(user.uid),
    }).then(() => {
      db.collection("Users").doc(user.uid).update({
        attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
        attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
        "settings.attendingEvent": true
      }).then(() => {
        navigation.goBack();
        alert("You are signed up :)");
      });
    });
  }

  // Decline attendance to recommended meetup
  const withdraw = () => {
    const storeID = {
      type: "recommendation",
      id: route.params.event.id,
    };

    db.collection("Users").doc(user.uid).update({
      attendingEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
      attendedEventIDs: firebase.firestore.FieldValue.arrayRemove(storeID),
      "settings.attendingEvent": false
    }).then(() => {
      db.collection("Private Events").doc(route.params.event.id).update({
        attendees: firebase.firestore.FieldValue.arrayRemove(user.uid)
      }).then(() => {
        alert("You withdrew from the meal :(");
        navigation.goBack();
      });
    });
  }

  // Function to navigate to the chat for this event
  const goToEventChat = async () => {
    if (route.params.event.chatID) {
      navigation.navigate("ChatRoom", {
        group: groupChat
      });

      try {
        await db.collection("Users").doc(user.uid).update({
          'settings.completedTutorial': true,
        });
      } catch (error) {
        console.error("Error updating document: ", error);
        // Handle the error appropriately
      }

    } else {
      alert("This feature is still in development and will be applied to your future events!")
    }
  };

  useEffect(() => {
    const unsubscribe = db.collection("Private Events").doc(route.params.event.id).onSnapshot((eventDoc) => {

      const eventData = eventDoc.data();
      let newStartDate = startDate;
      let newEndDate = endDate;
      let maxVote = 0;
      if (eventData.userVotes) {
        const voters = eventData.userVotes; 
        const voteCount = eventData.voteCount;
        const voter = voters && Object.keys(voters).includes(route.params.userData.id);
        if (voter) {
          setDayChosen(true);
  
          // Adjust seconds based on vote counts
          if (
            voteCount.mondayCount >= voteCount.tuesdayCount &&
            voteCount.mondayCount >= voteCount.wednesdayCount &&
            voteCount.mondayCount >= voteCount.thursdayCount
          ) {
            newStartDate = moment(newStartDate).subtract(3, 'days');
            newEndDate = moment(newEndDate).subtract(3,'days');
            maxVote = voteCount.mondayCount;
          } else if (
            voteCount.tuesdayCount >= voteCount.mondayCount &&
            voteCount.tuesdayCount >= voteCount.wednesdayCount &&
            voteCount.tuesdayCount >= voteCount.thursdayCount
          ) {
            newStartDate = moment(newStartDate).subtract(2,'days');
            newEndDate = moment(newEndDate).subtract(2,'days');
            maxVote = voteCount.tuesdayCount;

          } else if (
            voteCount.wednesdayCount >= voteCount.mondayCount &&
            voteCount.wednesdayCount >= voteCount.tuesdayCount &&
            voteCount.wednesdayCount >= voteCount.thursdayCount
          ) {
            newStartDate = moment(newStartDate).subtract(1,'days');
            newEndDate = moment(newEndDate).subtract(1,'days');
            maxVote = voteCount.wednesdayCount;

          } else if (
            voteCount.thursdayCount >= voteCount.mondayCount &&
            voteCount.thursdayCount >= voteCount.tuesdayCount &&
            voteCount.thursdayCount >= voteCount.wednesdayCount
          ) {
            maxVote = voteCount.thursdayCount;

          }
          if (startDate === newStartDate && endDate.seconds === newEndDate) {
          } else {
            setStartDate(newStartDate);
            setEndDate(newEndDate);
            setMaxVote(maxVote);
            db.collection("Private Events").doc(route.params.event.id).update({
              startDate: moment(newStartDate).toDate(),
              endDate: moment(newEndDate).toDate(),
            });
          }
        }
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []); 
        


  const updateAvailabilities = async (monday,tuesday,wednesday,thursday) => {
      const eventRef = db.collection("Private Events").doc(route.params.event.id);
      const eventDoc = await eventRef.get();
      const eventData = eventDoc.data();
      const userId = route.params.userData.id; 
      let previousVotes = eventData.userVotes?.[userId] || {}; 
      let voteUpdates = {};

      // Modifying updates
      if (previousVotes.monday && !monday) {
        voteUpdates["voteCount.mondayCount"] = firebase.firestore.FieldValue.increment(-1);
      } else {
        voteUpdates["voteCount.mondayCount"] = firebase.firestore.FieldValue.increment(0);
      }
      if (previousVotes.tuesday && !tuesday) {
        voteUpdates["voteCount.tuesdayCount"] = firebase.firestore.FieldValue.increment(-1);
      } else {
        voteUpdates["voteCount.tuesdayCount"] = firebase.firestore.FieldValue.increment(0);
      }
      if (previousVotes.wednesday && !wednesday) {
        voteUpdates["voteCount.wednesdayCount"] = firebase.firestore.FieldValue.increment(-1);
      } else {
        voteUpdates["voteCount.wednesdayCount"] = firebase.firestore.FieldValue.increment(0);
      }
      if (previousVotes.thursday && !thursday) {
        voteUpdates["voteCount.thursdayCount"] = firebase.firestore.FieldValue.increment(-1);
      } else {
        voteUpdates["voteCount.thursdayCount"] = firebase.firestore.FieldValue.increment(0);
      }
      // New User
      if (!previousVotes.monday && monday) {
        voteUpdates["voteCount.mondayCount"] = firebase.firestore.FieldValue.increment(1);
      }
      if (!previousVotes.tuesday && tuesday) {
        voteUpdates["voteCount.tuesdayCount"] = firebase.firestore.FieldValue.increment(1);
      }
      if (!previousVotes.wednesday && wednesday) {
        voteUpdates["voteCount.wednesdayCount"] = firebase.firestore.FieldValue.increment(1);
      }
      if (!previousVotes.thursday && thursday) {
        voteUpdates["voteCount.thursdayCount"] = firebase.firestore.FieldValue.increment(1);
      }
      voteUpdates[`userVotes.${userId}`] = { monday, tuesday, wednesday, thursday };
  
      await eventRef.update(voteUpdates);    
      showTimeFilterRef.current.close()
  } 



  // Fetch data from Firestore to see if the user has seen the tutorial before or not
  useEffect(() => {
    const fetchData = async () => {
      const docRef = db.collection('Users').doc(user.uid);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();

        if (data.settings?.attendingTutorial !== undefined) {
          setAttendingTutorial(data.settings.attendingTutorial);
        }
        
      } else {
        console.log('No such document!');
      }
      setIsDataFetched(true); // Set the fetched state to true after fetching is complete
    };

    fetchData();
  }, []);


  const incrementStep = () => {
    setRecSteps((prevStep) => prevStep + 1);
  }

  const decrementStep = () => {
    setRecSteps((prevStep) => prevStep - 1);
  }


  // Tutorial message for recommendations
  const recTutSteps = [
    {
      title: 'Recommendation',
      content: 'You can see the details of the location, date, time, and people you\'re meeting with.',
      enableNext: true,
      bottom: "8%",
    },
    {
      title: 'Recommendation',
      content: 'Click the \"Attend!\" button if you\'re interested in the event. You can always withdraw later if you change your mind.',
      enableBack: true,
      bottom: "63%",
    }
  ];

  return (
    <Layout>
      {attendingTutorial && 
        <>
          <RecTutorialMessage
            userId={user.uid}
            title={recTutSteps[recSteps].title}
            content={recTutSteps[recSteps].content}
            nextText={recTutSteps[recSteps].nextText}
            enableNext={recTutSteps[recSteps].enableNext}
            enableBack={recTutSteps[recSteps].enableBack}
            onNext={incrementStep}
            onBack={decrementStep}
            bottom={recTutSteps[recSteps].bottom}
          />
        </>
      }

      <TopNav
        middleContent={
          <MediumText center>Recommendation</MediumText>
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
        <View style={styles.infoContainer}>  
          <Container>
            <Image
              style={styles.image}
              source={route.params.event.hasImage ? {uri: route.params.event.image} : require("../../../assets/stockEvent.png")}
            />
            <View style={{...styles.row, "marginTop": 15}}>
                <LargeText size={18}>
                    {route.params.event.name}
                </LargeText>
                <MediumText size={18}> with:</MediumText>
            </View>

            <View style={styles.row}>
              {attendees.map((attendee, index) => 
                <TouchableOpacity style={styles.row}
                  onPress={() => {
                      navigation.navigate("FullProfile", {
                        person: attendee,
                      });
                  }}>
                  <NormalText size={16}>{index > 0 && " + "}</NormalText>
                  <Image source={attendee.hasImage ? { uri: attendee.image }
                    : require("../../../assets/logo.png")} style={styles.profileImg}/>
                  <NormalText size={16}>{attendee.firstName + " " + attendee.lastName.substring(0, 1) + "."}</NormalText>
                  {route.params.event.attendees.includes(attendee.id) && 
                    <Ionicons name="checkmark-circle" size={20} color="#5DB075" />}
                  {!route.params.event.attendees.includes(attendee.id) && 
                    <Ionicons name="help-circle" size={20} color="grey" />}
                </TouchableOpacity>
              )}
            </View>

            <TagsList tags={commonTags}/>

            {/* 3 meetup details (location, date, time} + menu are below */}

            <View style={styles.logistics}>
              {/* In-event chat button */}
              <View style={styles.eventChat}>
                <CircularButton onPress={() => goToEventChat()}>
                  {/* {groupChat && groupChat.unread && <View style={styles.unread}/>} */}
                  <Ionicons name="chatbox-ellipses-outline" size={30} />
                </CircularButton>
              </View>
              <View style={styles.row}>
                <Ionicons name="location-sharp" size={20} />
                <NormalText paddingHorizontal={10} color="black">
                  {route.params.event.location}
                </NormalText>
                <Link
                  onPress={() =>
                    openMap({ query: route.params.event.location, provider: "google" })
                  }
                >
                  (map)
                </Link>
              </View>

              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={20} />
                <NormalText paddingHorizontal={10} color="black">
                    {dayChosen ? getDate(moment(startDate).toDate())  : <Link onPress={() => {
                      showTimeFilterRef.current.open(),
                      setDayChosen(true)
                    }}> Choose an available day! </Link> }
                </NormalText>
                <NormalText paddingHorizontal={10} color="black">
                   Votes: {dayChosen ? maxVote :"" }
                </NormalText>
              </View>
              <RBSheet
                height={320}
                ref={showTimeFilterRef}
                closeOnDragDown={true}
                closeOnPressMask={false}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)",
                    },
                    draggableIcon: {
                        backgroundColor: "black"
                    },
                    container: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 10
                    }
            }}>
                <View style={styles.checkbox}>
                  <Checkbox checked = {monday} onPress={() => {
                        setMonday(!monday);
                  }} />
                  <MediumText>Monday</MediumText>
                </View>
                <View style={styles.checkbox}>
                  <Checkbox checked={tuesday} text="Tuesday" marginBottom={5}
                      onPress={() => {
                       setTuesday(!tuesday);  
                  }}/>
                  <MediumText>Tuesday</MediumText>
                </View>
                <View style={styles.checkbox}>
                  <Checkbox checked={wednesday} text="Wednesday" marginBottom={5}
                      onPress={() => {
                      setWednesday(!wednesday);

                  }}/>
                  <MediumText>Wednesday</MediumText>
                </View>
                <View style={styles.checkbox}>
                  <Checkbox checked={thursday} text="Thursday" marginBottom={5}
                      onPress={() => {
                        setThursday(!thursday);
                  }}/>
                  <MediumText>Thursday</MediumText>
                </View>
                <Button onPress = {() => updateAvailabilities(monday,tuesday,wednesday,thursday)}>
                  Add availabilities
                </Button>
            </RBSheet> 




              <View style={styles.row}>
                <Ionicons name="time-outline" size={20} />
                <NormalText paddingHorizontal={10} color="black">
                    {route.params.event.startDate ? getTime(moment(startDate).toDate()) : getTime(route.params.event.date.toDate())}
                    {route.params.event.endDate && " - ".concat(getTime(moment(endDate).toDate()))}
                </NormalText>
              </View>

              <View style={styles.row}>
                <Ionicons name="time-outline" size={20}/>
                <Link onPress={() => {showTimeFilterRef.current.open()}} paddingHorizontal={10}>
                    Modify availabilities
                </Link>
              </View>

              <View style={{...styles.row, marginTop: 10}}>
                <Ionicons name="star-outline" size={20} />
                <NormalText paddingHorizontal={10} color="black">
                    Rating: {route.params.event.rating} stars
                </NormalText>
              </View>

              <View style={styles.row}>
                <FontAwesome5 name="comment-dollar" size={20} />
                <NormalText paddingHorizontal={10} color="black">
                    Pricing: {route.params.event.price}
                </NormalText>
              </View>

              <View style={styles.row}>
                <FontAwesome5 name="external-link-alt" size={20}/>
                <Link onPress={() => Linking.openURL(route.params.event.url)} paddingHorizontal={10}>
                    More info
                </Link>
              </View>

            </View>

            {route.params.event.menu && <View>
              <Toggle
                open={openMenu}
                onPress={() => setOpenMenu(!openMenu)}
                title="Menu"
              />
              {openMenu && route.params.event.menu.map(item => <NormalText>{item}</NormalText>)}
            </View>}
          </Container>

          <View style={styles.buttonRow}>
            {!isAttending ? <Button onPress={attend} disabled={loading}>
              {!loading ? "Attend!" : "Loading..."}
            </Button> : <BorderedButton onPress={withdraw} disabled={loading} color="red">
              {!loading ? "Withdraw :(" : "Loading..."}
            </BorderedButton>}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10
  },

  infoContainer: {
    marginHorizontal: 30,
    marginBottom: 50,
    marginTop: 20
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    flexWrap: "wrap"
  },

  profileImg: {
    width: 25,
    height: 25,
    borderRadius: 25,
    borderColor: "#5DB075",
    borderWidth: 1,
    backgroundColor: "white",
    marginRight: 3
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30
  },

  imageBackground: {
    width: Dimensions.get("screen").width,
    height: 150,
    marginBottom: 20,
  },

  logistics: {
    marginVertical: 15,
  },

  eventChat: {
    position: "absolute",
    bottom: 0,
    right: 0,
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
  },
  checkbox:{
    flexDirection: "row", 
    padding: 10, 
    alignItems: "center", 
    justifyContent: 'left',
  },
});

export default Recommendation;