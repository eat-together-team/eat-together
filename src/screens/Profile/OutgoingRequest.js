// Display the incoming/outgoing buddy requests when the people icon is pressed
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, FlatList, View, Dimensions, TouchableOpacity, ScrollView } from "react-native";
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
import ProfileBubble from "../../components/ProfileBubble";

import { getTimeOfDay, isAvailable, compareDates, getCommonTags, generateColor, randomize3 } from "../../methods";
import { auth, db } from "../../provider/Firebase";

export default function({ navigation }) {
    const tryoutId = 'knVtYe1mtpaZ9D8XLDrS7FCImtm2'; // ID of test user

    // Fetch current user
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});
    const [unread, setUnread] = useState(false); // See if we need to display unread notif icon

    const [events, setEvents] = useState([]); // All public events
    const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events
    const [filteredSearchedEvents, setFilteredSearchedEvents] = useState([]); // Events that are filtered and search-queried

    const [searchQuery, setSearchQuery] = useState("");

    const [people, setPeople] = useState([]); // List of all users

    // Display a bottom drawer showing more filters
    const showTimeFilterRef = useRef();

    const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

    useEffect(() => {
      // updates stuff right after React makes changes to the DOM
      async function fetchData() {
        const ref = db.collection("Users");
        let userData;

        await ref
          .doc(user.uid)
          .get()
          .then((doc) => {
            setUserInfo(doc.data());
            userData = doc.data();
          });
        
        // Get all users
        await ref.onSnapshot((query) => {
          let users = [];
          query.forEach((doc) => {
            let data = doc.data();
            if (data.id !== user.uid && data.verified) { // Only show verified + unblocked + non-friend users + non-private accounts
              data.inCommon = getCommonTags(userData, data);
              data.color = generateColor();
              data.selectedTags = randomize3(data.tags);
              users.push(data);
            }
          });
  
          setPeople(users);
          setLoading(false);
        });
      }
  
      fetchData();
    }, []);

    return (
      <Layout>
        <Header name="Requests" navigation={navigation} hasNotif={unread} notifs/>
        <HorizontalSwitch
          left="Incoming Request"
          right="Outgoing Request"
          current="right"
          press={() => navigation.navigate("Outgoing Request")}
        />

      <View style={{ flex: 1, alignItems: "center" }}>
        {loading ?
          <LoadingView/>
        : people.length > 0 ? 
        <FlatList
            contentContainerStyle={styles.people}
            keyExtractor={(item) => item.id}
            data={people}
            renderItem={({ item }) => (
              <NameBubble
                person={item}
                click={() => {
                  navigation.navigate("FullProfile", {
                    person: item,
                  });
                }}
              />
            )}
          />
        :
          <EmptyState title="No Requests" text="start making new friends!"/>
        }
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: Dimensions.get('screen').width - 40,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: {
        width: 0,
        height: 4,
    },
    elevation: 10
},
});
