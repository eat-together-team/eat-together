// Display your events

import React, { useEffect, useState, useContext, useRef } from "react";
import {View, StyleSheet, FlatList, SectionList} from "react-native";
import { Layout } from "react-native-rapi-ui";
import RBSheet from "react-native-raw-bottom-sheet";

import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import Searchbar from "../../components/Searchbar";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import Link from "../../components/Link";

import { db, auth } from "../../provider/Firebase";
import { AuthContext } from "../../provider/AuthProvider";
import { compareDates } from "../../methods";
import moment from "moment";
import MediumText from "../../components/MediumText";
import Me from "../Profile/Me";
import RecommendationsCard from "../../components/RecommendationsCard";

export default function ({ navigation }) {
  // Get current user
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState(null);

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
          await db.collection("Private Events").doc(id).onSnapshot(recDoc => {
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
      })
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
    // TODO: Rachel Fix!
    /*
        const user = auth.currentUser;
        db.collection("Private Events").doc(id).update({
            attendees : firebase.firestore.FieldValue.arrayRemove(user.uid)
        }).then(() => {
            db.collection("Private Events").doc(id).get().then((doc) => {
                if (doc.data().attendees.length == 0) {
                }
            });
        });
         */
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

  return (
    <Layout>
      <Header name="Your Meals" navigation={navigation} hasNotif={unread} notifs/>

      <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
        <Searchbar
          placeholder="Search by name, tags, or host name"
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
    </Layout>
  );
}

const styles = StyleSheet.create({
  cards: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
  }
});
