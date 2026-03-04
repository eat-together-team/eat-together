// Display upcoming events to join

import React, { useEffect, useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Layout } from "react-native-rapi-ui";

import EventCard from "../../components/EventCard";
import Header from "../../components/Header";
import Searchbar from "../../components/Searchbar";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";

import { compareDates } from "../../utils/methods";
import { db } from "../../provider/Firebase";
import Button from "../../components/Button";

export default function({ navigation }) {
    const [events, setEvents] = useState([]); // All public events
    const [filteredEvents, setFilteredEvents] = useState([]); // Filtered events

    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

    useEffect(() => { // updates stuff right after React makes changes to the DOM
      async function fetchData() {
        /*
          TODO: fetch all public events from the "Public Events" collection in Firestore
          and add these to the events and filteredEvents state variables above.

          Things to do:
          - Reference to the "Public Events" collection, and use the ref.onSnapshot method to read in the collection data.
          - Define an empty array (e.g. newEvents), and push all the events to this array by iterating through the query (query.forEach).
            If you're stuck how to do this, refer to our slides about fetching data from Firestore.
          - Sort the events by date using the following code:
            newEvents = newEvents.sort((a, b) => {
              return compareDates(a, b);
            });
          - Set the events and filteredEvents state variables to newEvents, and set the loading state variable to false.
        */
      }

      fetchData();
    }, []);
    
    /*
      TODO: implement a method called search that takes in two parameters:
      - newEvents: array of events to filter out
      - text: search query

      This method should return an array of events that match the search query.
      Hint: use the isMatch helper method written below.
    */

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
      const newEvents = search(events, text);
      setFilteredEvents(newEvents);
    };

    /*
      Extra challenge: add some functionality for filters. Refer to Explore.js for an example of how to implement this!
    */

    return (
      <Layout>
        <Header name="Explore" navigation={navigation}/>

        <View style={{ paddingHorizontal: 20 }}>
          {/* 
            TODO: Add a Searchbar to filter events. This Searchbar should have the following props:
            - placeholder: {your choice}
            - value: {HINT: a state variable}
            - onChangeText: onChangeText
          */}
        </View>
      
      
      <View style={{ flex: 1 }}>
        {loading ?
          <LoadingView/>
        : filteredEvents.length > 0 ? 
          {/* 
            TODO: Display the events in a FlatList. This FlatList should have the following props:
            - contentContainerStyle: styles.cards
            - keyExtractor: item => item.id
            - data: {HINT: a state variable}
            - renderItem: ({item}) => <EventCard event={item}/>
          */}
        :
          <EmptyState title="No Meals" text="Organize your own, or start making new friends!"/>
        }
      </View>

      <Button onPress={() => {
        navigation.goBack();
      }} marginVertical={50}>
        Back
      </Button>
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
