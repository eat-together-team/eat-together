//Display upcoming events to join

import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Layout } from "react-native-rapi-ui";
import RBSheet from "react-native-raw-bottom-sheet";

import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import HorizontalSwitch from "../../components/HorizontalSwitch";
import Searchbar from "../../components/Searchbar";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import Link from "../../components/Link";

import { getTimeOfDay, isAvailable, compareDates } from "../../methods";
import { auth, db } from "../../provider/Firebase";

export default function({ navigation }) {
    // Fetch current user
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});
    const [unread, setUnread] = useState(false); // See if we need to display unread notif icon

    const [events, setEvents] = useState([]); // All public events
    const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events
    const [filteredSearchedEvents, setFilteredSearchedEvents] = useState([]); // Events that are filtered and search-queried

    const [searchQuery, setSearchQuery] = useState("");

    // Filters
    const [popularity, setPopularity] = useState(false);
    const [available, setAvailable] = useState(false);
    const [fromFriends, setFromFriends] = useState(false);
    const [friendsAttending, setFriendsAttending] = useState(false);
    const [morning, setMorning] = useState(false);
    const [afternoon, setAfternoon] = useState(false);
    const [evening, setEvening] = useState(false);

    // Display a bottom drawer showing more filters
    const showSortFilterRef = useRef();
    const showTimeFilterRef = useRef();

    const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

    useEffect(() => { // updates stuff right after React makes changes to the DOM
        async function fetchData() {
            let userData;
            await db.collection("Users").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                  userData = doc.data();
                  setUserInfo(doc.data());
                  setUnread(doc.data().hasNotif);
                }
            });

            const ref = db.collection("Public Events");
            await ref.onSnapshot((query) => {
                let newEvents = [];
                query.forEach((doc) => {
                    if (doc.data().visibleTo != null) { // For events that are visible to friends only
                        if (!doc.data().visibleTo.includes(user.uid) && !(doc.data().hostID === user.uid)) return;
                    }

                    if (doc.data().startDate) { // Same logic as else statement, but for different data structure
                      if (doc.data().startDate.toDate() > new Date() && 
                        !userData.blockedIDs.includes(doc.data().hostID)) {
                          newEvents.push(doc.data());
                      }
                    } else {
                      if (doc.data().date.toDate() > new Date() && 
                        !userData.blockedIDs.includes(doc.data().hostID)) {
                          newEvents.push(doc.data());
                      }
                    }
                });
                
                // Sort events by date
                newEvents = newEvents.sort((a, b) => {
                    return compareDates(a, b);
                });
                setEvents(newEvents);
                setFilteredEvents(newEvents);
                setFilteredSearchedEvents(newEvents);
                setLoading(false);
            });
        }

        fetchData();
    }, []);

    // For filters
    useEffect(() => {
      async function filter() {
        setLoading(true);
        let newEvents = [...events];

        if (popularity) {
          newEvents = sortByPopularity(newEvents);
        }

        if (available) {
          newEvents = filterByAvailability(newEvents);
        }

        if (fromFriends) {
          newEvents = filterByFriendsHosting(newEvents);
        }

        if (friendsAttending) {
          newEvents = filterByFriendsAttending(newEvents);
        }

        if (morning) {
          newEvents = filterByTime("morning", newEvents);
        }

        if (afternoon) {
          newEvents = filterByTime("afternoon", newEvents);
        }

        if (evening) {
          newEvents = filterByTime("evening", newEvents);
        }

        setFilteredEvents(newEvents);

        const newSearchedEvents = search(newEvents, searchQuery);
        setFilteredSearchedEvents(newSearchedEvents);
      }

      if (events.length > 0) {
        filter().then(() => setLoading(false));
      }
    }, [
      popularity,
      available,
      fromFriends,
      friendsAttending,
      morning,
      afternoon,
      evening,
    ]);

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
      if (event.tags.some(tag => tag.toLowerCase().includes(text.toLowerCase()))) {
        return true;
      }

      // Host
      if (event.hostName) {
        return event.hostName.toLowerCase().includes(text.toLowerCase());
      }

      const fullName = event.hostFirstName + " " + event.hostLastName;
      return fullName.toLowerCase().includes(text.toLowerCase());
    };

    // Method called when a new query is typed in/deleted
    const onChangeText = (text) => {
      setSearchQuery(text);
      const newEvents = search(filteredEvents, text);
      setFilteredSearchedEvents(newEvents);
    };

    // Sort events by popularity
    const sortByPopularity = (newEvents) => {
      newEvents = newEvents.sort(
        (a, b) => b.attendees.length - a.attendees.length
      );
      return newEvents;
    };

    // Display events that match the user's availabilities
    const filterByAvailability = (newEvents) => {
      return newEvents.filter(e => isAvailable(userInfo, e));
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

    return (
      <Layout>
        <Header name="Explore" navigation={navigation} hasNotif={unread} notifs/>
        <HorizontalSwitch
          left="Meals"
          right="People"
          current="left"
          press={() => navigation.navigate("People")}
        />

        <View style={{ paddingHorizontal: 20 }}>
          <Searchbar placeholder="Search by name, tags, or host name"
            value={searchQuery} onChangeText={onChangeText}/>
          
          <HorizontalRow>
            <Filter checked={available}
              onPress={() => setAvailable(!available)} text="Fits schedule"/>
            <Filter checked={morning || afternoon || evening}
              onPress={() => showTimeFilterRef.current.open()}
              text={morning ? "Morning" : 
                afternoon ? "Afternoon" : 
                evening ? "Evening" : "Time of day"}/>
            <Filter checked={popularity}
              onPress={() => setPopularity(!popularity)}
              text="Popularity"/>
            <Filter checked={fromFriends}
              onPress={() => setFromFriends(!fromFriends)} text="From friends"/>
            <Filter checked={friendsAttending}
              onPress={() => setFriendsAttending(!friendsAttending)} text="Friends attending"/>
          </HorizontalRow>
        </View>

        <RBSheet
          height={300}
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
          <Filter checked={morning} text="Morning" marginBottom={5}
            onPress={() => {
              setMorning(!morning);
              setAfternoon(false);
              setEvening(false);
              showTimeFilterRef.current.close();
            }}/>
          <Filter checked={afternoon} text="Afternoon" marginBottom={5}
            onPress={() => {
              setAfternoon(!afternoon);
              setMorning(false);
              setEvening(false);
              showTimeFilterRef.current.close();
            }}/>
          <Filter checked={evening} text="Evening" marginBottom={20}
            onPress={() => {
              setEvening(!evening);
              setMorning(false);
              setAfternoon(false);
              showTimeFilterRef.current.close();
            }}/>
          <Link onPress={() => {
            setMorning(false);
            setAfternoon(false);
            setEvening(false);
            showTimeFilterRef.current.close();
          }}
        >
          Clear
        </Link>
      </RBSheet> 

      <View style={{ flex: 1 }}>
        {loading ?
          <LoadingView/>
        : filteredSearchedEvents.length > 0 ? 
          <FlatList contentContainerStyle={styles.cards} keyExtractor={item => item.id}
            data={filteredSearchedEvents} renderItem={({item}) =>
              <EventCard event={item} click={() => {
                  //ampInstance.logEvent('BUTTON_CLICKED'); // EXPERIMENT
                navigation.navigate("FullCard", {
                  event: item
                });
              }}/>
          }/>
        :
          <EmptyState title="No Meals" text="Organize your own, or start making new friends!"/>
        }
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  cards: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
});
