// Homepage! Displays your meals as well as recommendations

import React, { useEffect, useState, useContext, useRef } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Layout } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";

import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import Searchbar from "../../components/Searchbar";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import TutorialMessage from "../../components/TutorialMessage";
import RecTutorialMessage from "../../components/RecTutorialMessage";
import Link from "../../components/Link";
import Button from "../../components/Button"

import { db, auth } from "../../provider/Firebase";
import { AuthContext } from "../../provider/AuthProvider";
import { compareDates } from "../../utils/methods";
import MediumText from "../../components/MediumText";
import RecommendationsCard from "../../components/RecommendationsCard";

export default function ({ navigation }) {
  // Get current user
  const user = auth.currentUser;

  const [userInfo, setUserInfo] = useState(null);
  const [step, setStep] = useState(0); // Used to display tutorial message
  const [recStep, setRecStep] = useState(0);  // Used to display rec tutorial message

  const [events, setEvents] = useState([]); // All personal events
  const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events
  const [filteredSearchedEvents, setFilteredSearchedEvents] = useState([]); // Events that are filtered and search-queried

  // Get recommendations
  const [hasRec, setHasRec] = useState(false);
  const [recommendations, setRecommendations] = useState([])

  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [publicEvents, setPublicEvents] = useState(false);
  const [privateEvents, setPrivateEvents] = useState(false);
  const [fromYourself, setFromYourself] = useState(false);
  const [fromFriends, setFromFriends] = useState(false);
  const [friendsAttending, setFriendsAttending] = useState(false);

  const [unread, setUnread] = useState(false); // See if we need to display unread notif icon
  const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

  const updateProfileImg = useContext(AuthContext).updateProfileImg; // Used to update profile image in navbar on load

  const [tabsTutorial, setTabsTutorial] = useState(true);  // State to see if we should show the tabs tutorial
  const [attendingTutorial, setAttendingTutorial] = useState(true);  // State to see if we should show the attending an event tutorial

  const [isDataFetched, setIsDataFetched] = useState(false);  // State to track whether data has been fetched

  // Display a bottom drawer showing more filters
  const showTypeRef = useRef();
  const showFromRef = useRef();

  useEffect(() => {
    // updates stuff right after React makes changes to the DOM
    async function fetchEvents() {
      await db
        .collection("Users")
        .doc(user.uid)
        .onSnapshot((doc) => {
          let newEvents = [];
          if (doc.data()) {
            setUserInfo(doc.data());
            updateProfileImg(doc.data().image);
            setUnread(doc.data().hasNotif);
            let eventsLength = doc.data().attendingEventIDs.length;

            doc.data().attendingEventIDs.forEach((e) => {
              let type = "Private Events";
              if (e.type === "public") {
                type = "Public Events";
              }

              db.collection(type)
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
                      return compareDates(a, b);
                    });

                    setEvents(newEvents);
                    setFilteredEvents(newEvents);
                    setFilteredSearchedEvents(newEvents);
                  }
                }).catch(e => {
                  alert("There was an error fetching some of your meals :( try again later");

                  eventsLength--;
                  newEvents = newEvents.sort((a, b) => {
                    return compareDates(a, b);
                  });

                  setEvents(newEvents);
                  setFilteredEvents(newEvents);
                  setFilteredSearchedEvents(newEvents);
                });
            });
          }
        });
    }

    // Get the current recommendations for the user, if any
    async function fetchRecs() {
      await db.collection("Users").doc(user.uid).onSnapshot((doc) => {
        if (doc.data()) {
          // Gather the recommendation IDs for each recommendation the user has
          let recIDs = [];
          doc.data().notifications.forEach(notif => {
            if(notif.type === "recommendation") recIDs.push(notif.id);
          });

          if (recIDs.length === 0) {
            setLoading(false);
            return;
          }

          let recEvents = [];
          let asyncCounter = 0; // Counter to see how many events have been fetched
          recIDs.forEach(async id => {
            await db.collection("Private Events").doc(id).get().then(recDoc => {
              let recDocData = recDoc.data();
              recDocData.isARec = true;
              recDocData.hostFirstName = "Eat Together Team!";
              recDocData.hostLastName = "";
              recEvents.push(recDocData);

              asyncCounter++;
              if(asyncCounter === recIDs.length) {
                recEvents.sort((a, b) => {
                  return compareDates(a, b);
                });

                setHasRec(true)
                setRecommendations(recEvents);
                setLoading(false);
              }
            });
          });
        }
      });
    }

    fetchEvents().then(() => {
      fetchRecs().then(() => {
        // Verify user when they log in for the first time
        db.collection("Users").doc(user.uid).update({
          verified: true
        });

        setLoading(false); // Stop showing loading screen
      });
    });
  }, []);

  // For filters
  useEffect(() => {
    setLoading(true);
    let newEvents = [...events];

    if (publicEvents) {
      newEvents = newEvents.filter((e) => e.type === "public");
    }

    if (privateEvents) {
      newEvents = newEvents.filter((e) => e.type === "private");
    }

    if (fromYourself) {
      newEvents = newEvents.filter((e) => e.hostID === user.uid);
    }

    if (fromFriends) {
      newEvents = filterByFriendsHosting(newEvents);
    }

    if (friendsAttending) {
      newEvents = filterByFriendsAttending(newEvents);
    }

    setFilteredEvents(newEvents);

    const newSearchedEvents = search(newEvents, searchQuery);
    setFilteredSearchedEvents(newSearchedEvents);
    setLoading(false);
  }, [publicEvents, privateEvents, fromYourself, fromFriends, friendsAttending]);

  // Method to filter out events
  const search = (newEvents, text) => {
    return newEvents.filter((e) => isMatch(e, text));
  };

  // Determines if an event matches search query or not
  const isMatch = (event, text) => {
    // Name
    if (event.name.toLowerCase().includes(text.toLowerCase())) {
      return true;
    }

    // Tags
    if (event.tags) {
      if (event.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))) {
        return true;
      }
    }

    // Host
    if (event.hostName) {
      return event.hostName.toLowerCase().includes(text.toLowerCase());
    }

    const fullName = event.hostFirstName + " " + event.hostLastName;
    return fullName.toLowerCase().includes(text.toLowerCase());
  }

  // Method called when a new query is typed in/deleted
  const onChangeText = (text) => {
    setSearchQuery(text);
    const newEvents = search(filteredEvents, text);
    setFilteredSearchedEvents(newEvents);
  };

  // Deletes event from DOM and updates Firestore
  const deleteEvent = (id) => {
    const newEvents = events.filter((e) => e.id !== id);
    const newFilteredEvents = filteredEvents.filter((e) => e.id !== id);
    const newFilteredSearchedEvents = filteredSearchedEvents.filter((e) => e.id !== id);
    setEvents(newEvents);
    setFilteredEvents(newFilteredEvents);
    setFilteredSearchedEvents(newFilteredSearchedEvents);
  };

  // Display public events only
  const publicOnly = () => {
    setPublicEvents(!publicEvents);
    setPrivateEvents(false);
    showTypeRef.current.close();
  };

  // Display private events only
  const privateOnly = () => {
    setPrivateEvents(!privateEvents);
    setPublicEvents(false);
    showTypeRef.current.close();
  };

  // Display events from yourself only
  const fromYourselfOnly = () => {
    setFromYourself(!fromYourself);
    setFromFriends(false);
    showFromRef.current.close();
  }

  // Display events from friends only
  const fromFriendsOnly = () => {
    setFromFriends(!fromFriends);
    setFromYourself(false);
    showFromRef.current.close();
  }

  // Display events that friends are hosting
  const filterByFriendsHosting = (newEvents) => {
    newEvents = newEvents.filter((e) => userInfo.friendIDs.includes(e.hostID));
    return newEvents;
  };

  // Display events that friends are attending
  const filterByFriendsAttending = (newEvents) => {
    newEvents = newEvents.filter((e) => {
      let included = false;

      e.attendees.forEach((a) => {
        if (userInfo.friendIDs.includes(a)) {
          included = true;
          return;
        }
      });

      return included;
    });

    return newEvents;
  };

  // Replace event with new event details
  const editEvent = newEvent => {
    const newEvents = events.map(e => {
      if (e.id === newEvent.id) {
        return {
          ...e,
          ...newEvent
        };
      }
      return e;
    });

    const newFilteredEvents = filteredEvents.map(e => {
      if (e.id === newEvent.id) {
        return {
          ...e,
          ...newEvent
        };
      }
      return e;
    });

    const newFilteredSearchedEvents = filteredSearchedEvents.map(e => {
      if (e.id === newEvent.id) {
        return {
          ...e,
          ...newEvent
        };
      }
      return e;
    });

    setEvents(newEvents);
    setFilteredEvents(newFilteredEvents);
    setFilteredSearchedEvents(newFilteredSearchedEvents);
  }

  const renderItem = ({ item }) => {
    if(typeof item === "string") {
      return <MediumText marginBottom={10} textAlign={"auto"}>{item}</MediumText>
    } else if(item.isARec) {
      return(
        <RecommendationsCard
          event={item}
          click={() => {
            navigation.navigate("Recommendation", {
              event: item,
              userData: userInfo
            });
          }}
        />
      )
    } else {
      return(
        <EventCard
            event={item}
            click={() => {
              navigation.navigate("WhileYouEat", {
                event: item,
                deleteEvent,
                editEvent
              });
            }}
        />
      )
    }
  };

  const incrementStep = () => {
    setStep(prevStep => prevStep + 1);
  }

  const decrementStep = () => {
    setStep(prevStep => prevStep - 1);
  }

  const tutorialSteps = [
    {
      title: 'Hello!',
      content: 'Welcome to Eat Together! This tutorial will show you how to use the app!',
      disableBack: true,
      bottom: "40%",
      modalHeight: 300,
    },
    {
      title: 'Home page!',
      content: 'This is where you see all the meals you signed up for as well as recommended meals generated by the app!',
      angle: -143,  // Angle of the arrow
      length: 24.5,  // Length of the arrow
    },
    {
      title: 'Find a meal!',
      content: 'Use this tab to explore upcoming meetups and connect with new friends!',
      angle: -160,
      length: 21,
    },
    {
      title: 'Host a meal!',
      content: 'Go to this tab to organize meetups that are available to everyone or to people you can invite specifically!',
      angle: -180,
      length: 20,
    },
    {
      title: 'Inbox!',
      content: 'This is where you can find notifications (e.g. friend requests, invited meetups) and messages from friends!',
      angle: -200,
      length: 21,
    },
    {
      title: 'Profile!',
      content: 'Your preferences and information comes here, and you can also find meals that you have attended in the past!',
      disableNext: true,
      angle: -217,
      length: 24.5,
    },
  ];

  // recommended tutorial steps
  const recTutorialSteps = [
    {
      title: 'Getting Started',
      content: 'Click on the selection above to discover a curated meetup just for you! You\'ll get a new one every Sunday!',
      bottom: "2%",
    },
    {
      title: 'Homepage',
      content: 'Now click on the meetup you just signed for below in "Your Meals" to see more details!',
      bottom: "72%",
    },
    {
      title: 'Have Fun Eating Together!',
      content: "This is just the tip of the iceberg. Enjoy everything this app has to offer!",
      bottom: "2%",
      completed: true,
    }
  ];


  // Callback function to update user info
  const setuserInfoCallBack = () => {
    // Create a new object rather than mutating the existing one to ensure React updates the component
    const updatedUserInfo = { ...userInfo, tutorial: false };
    setUserInfo(updatedUserInfo);

    // Set tabsTutorial to false and attendingTutorial to true to initiate RecTutorialMessage
    setTabsTutorial(false);
    setAttendingTutorial(true);

    // Update the database with new values for tabsTutorial and attendingTutorial
    db.collection('Users').doc(user.uid).set({
      settings: {
        tabsTutorial: false,
        attendingTutorial: true,
      },
    }, { merge: true });
  };


  // Fetch data from Firestore to see if the user has seen the tutorial before or not
  useEffect(() => {
    const fetchData = async () => {
      const docRef = db.collection('Users').doc(user.uid);
      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();

        if (data.settings?.tabsTutorial !== undefined) {
          setTabsTutorial(data.settings.tabsTutorial);
        }

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


  // Listen for changes in the attendingEvent value in Firestore and update the recStep accordingly
  useEffect(() => {
    // Fetch the attendingEvent value from Firebase here
    const docRef = db.collection('Users').doc(user.uid);

    // Listen for real-time updates
    const unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        const attendingEvent = data?.settings?.attendingEvent; // Correct path to attendingEvent
        const completedTutorial = data?.settings?.completedTutorial; // Correct path to attendingTutorial

        // Change the recStep based on attendingEvent value
        if (attendingEvent) {
          setRecStep((prevRecStep) => {
            const newRecStep = Math.min(prevRecStep + 1, recTutorialSteps.length - 1);
            return newRecStep;
          });
        } else if (completedTutorial) {
          // Set the recStep to the last step if the user has completed the tutorial
          setRecStep(recTutorialSteps.length - 1);
        } else {
          //  Reset to the first step
          setRecStep(0);
        }
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();

  }, []);

  useEffect(() => {
    console.log("recStep: ", recStep);
  }, [recStep])

  if (!isDataFetched) return null; // Don't render anything if data hasn't been fetched

  return (
    <Layout>
      {userInfo && /*!userInfo.tutorial && */ tabsTutorial && // NOTE: set "userInfo.tutorial" to "!userInfo.tutorial" to see the tutorial
        <>
          <TutorialMessage
            userId={user.uid}
            bottom={tutorialSteps[step].bottom}
            modalHeight={tutorialSteps[step].modalHeight}
            title={tutorialSteps[step].title}
            content={tutorialSteps[step].content}
            nextText={tutorialSteps[step].nextText}
            angle={tutorialSteps[step].angle}
            length={tutorialSteps[step].length}
            next={!tutorialSteps[step].disableNext ? incrementStep : null}
            back={!tutorialSteps[step].disableBack ? decrementStep : null}
            disableNext={tutorialSteps[step].disableNext}
            disableBack={tutorialSteps[step].disableBack}
            callback={setuserInfoCallBack}
          />
        </>
      }

      {userInfo && !tabsTutorial && attendingTutorial &&
        <>
          <RecTutorialMessage
            userId={user.uid}
            title={recTutorialSteps[recStep].title}
            content={recTutorialSteps[recStep].content}
            bottom={recTutorialSteps[recStep].bottom}
            nextText={recTutorialSteps[recStep].nextText}
            completedTutorial={recTutorialSteps[recStep].completed}
            callback={setuserInfoCallBack}
          />
        </>
      }

      <Header name="Your Meals" navigation={navigation} hasNotif={unread} notifs/>

      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Searchbar
          placeholder="Search by name, tags, or host name"
          // placeholder={step}
          value={searchQuery}
          onChangeText={onChangeText}
        />

        <HorizontalRow>
          <Filter checked={publicEvents || privateEvents}
            onPress={() => showTypeRef.current.open()}
            text={publicEvents ? "Public" :
              privateEvents ? "Private" : "Type of meal"}/>
          <Filter checked={fromYourself || fromFriends}
            onPress={() => showFromRef.current.open()}
            text={fromYourself ? "Yourself" :
              fromFriends ? "Friends" : "Hosted by"}/>
          <Filter
            checked={friendsAttending}
            onPress={() => setFriendsAttending(!friendsAttending)}
            text="Friends attending"
          />
        </HorizontalRow>
      </View>

      {!loading ? filteredSearchedEvents.length > 0 ? (searchQuery === "" && hasRec) ?
        <FlatList
            contentContainerStyle={styles.cards}
            keyExtractor={(item) => item.id}
            data={["Recommendations"].concat(recommendations, ["Your Meals"], filteredSearchedEvents)}
            renderItem={renderItem}
        />
      :
        <FlatList
          contentContainerStyle={styles.cards}
          keyExtractor={(item) => item.id}
          data={filteredSearchedEvents}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              click={() => {
                navigation.navigate("WhileYouEat", {
                  event: item,
                  deleteEvent,
                  editEvent
                });
              }}
            />
          )}
        />
      :
          (searchQuery === "" && hasRec) ?
              <FlatList
                  contentContainerStyle={styles.cards}
                  keyExtractor={(item) => item.id}
                  data={["Recommendations"].concat(recommendations)}
                  renderItem={renderItem}
              />
              :
              <EmptyState title="No Upcoming Meals" text="Explore different meals, or organize one on your own!"/>
      :
        <LoadingView/>
      }

      <RBSheet
          height={300}
          ref={showTypeRef}
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
          <Filter checked={publicEvents} text="Public" marginBottom={5}
            onPress={publicOnly}/>
          <Filter checked={privateEvents} text="Private" marginBottom={20}
            onPress={privateOnly}/>
          <Link onPress={() => {
            setPublicEvents(false);
            setPrivateEvents(false);
            showTypeRef.current.close();
          }}
        >
          Clear
        </Link>
      </RBSheet>

      <RBSheet
          height={300}
          ref={showFromRef}
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
          <Filter checked={fromYourself} text="Yourself" marginBottom={5}
            onPress={fromYourselfOnly}/>
          <Filter checked={fromFriends} text="Friends" marginBottom={20}
            onPress={fromFriendsOnly}/>
          <Link onPress={() => {
            setFromYourself(false);
            setFromFriends(false);
            showFromRef.current.close();
          }}
        >
          Clear
        </Link>
      </RBSheet>

      {/* Button to redirect to personal Photo Gallery */}
      <View style={styles.button}>
        <Button icon={(
          <Ionicons name="image-outline" color="white" size={20}/>
        )} onPress={() => navigation.navigate("Gallery",{user: userInfo})}>
          My Gallery
        </Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  },
  button: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 1,
  },
});
