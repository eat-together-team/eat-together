//Meet other people

import React, { useEffect, useState } from "react";
import { FlatList, View, ActivityIndicator, StyleSheet } from "react-native";
import { Layout } from "react-native-rapi-ui";

import Searchbar from "../../../components/Searchbar";
import ProfileBubble from "../../../components/ProfileBubble";
import Header from "../../../components/Header";
import HorizontalRow from "../../../components/HorizontalRow";
import HorizontalSwitch from "../../../components/HorizontalSwitch";
import Filter from "../../../components/Filter";
import EmptyState from "../../../components/EmptyState";
import LoadingView from "../../../components/LoadingView";

import { generateColor, randomize3, getCommonTags } from "../../../methods";
import { db, auth } from "../../../provider/Firebase";
import { sortBySimilarInterests } from "../../../methods";


export default function ({ navigation }) {
  const tryoutId = 'knVtYe1mtpaZ9D8XLDrS7FCImtm2'; // ID of test user

  // Fetch current user
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState({});
  const [unread, setUnread] = useState(false); // See if we need to display unread notif icon

  const [mutuals, setMutuals] = useState([]); // Mutual friends

  const [people, setPeople] = useState([]); // List of all users
  const [filteredPeople, setFilteredPeople] = useState([]); // List of filtered users
  const [filteredSearchedPeople, setFilteredSearchPeople] = useState([]); // List of users with filters and search query on

  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [similarInterests, setSimilarInterests] = useState(false);
  const [mutualFriends, setMutualFriends] = useState(false);

  const [loading, setLoading] = useState(true); // State variable to show loading screen when fetching data

  // Fetch all users
  useEffect(() => {
    // updates stuff right after React makes changes to the DOM
    async function fetchData() {
      const ref = db.collection("Users");
      let userData;

      // Finds mutual friends
      await ref
        .doc(user.uid)
        .get()
        .then((doc) => {
          setUserInfo(doc.data());
          userData = doc.data();
          setUnread(doc.data().hasNotif);

          doc.data().friendIDs.forEach((id) => {
            db.collection("Users")
              .doc(id)
              .get()
              .then((doc) => {
                if (doc && doc.data().friendIDs) { // Necessary check to prevent crash
                  setMutuals((mutuals) =>
                    mutuals.concat(doc.data().friendIDs)
                  );
                }
              });
          });
        });
      
      // Get all users
      await ref.onSnapshot((query) => {
        let users = [];
        query.forEach((doc) => {
          let data = doc.data();
          if (data.id !== user.uid && data.verified && !userData.blockedIDs.includes(doc.data().id)
            && !doc.data().blockedIDs.includes(user.uid) && !userData.friendIDs.includes(doc.data().id)) { // Only show verified + unblocked + non-friend users + non-private accounts
            data.inCommon = getCommonTags(userData, data);
            data.color = generateColor();
            data.selectedTags = randomize3(data.tags);
            users.push(data);
          }
        });

        setPeople(users);
        setFilteredPeople(users);
        setFilteredSearchPeople(users.filter(person => (person.settings.privateAccount == null || !person.settings.privateAccount)));
        setLoading(false);
      });
    }

    fetchData();
  }, []);


  // Filters
  useEffect(() => {
    async function filter() {
      setLoading(true);
      let newPeople = [...people];
  
      if (similarInterests) {
        newPeople = await sortBySimilarInterests(userInfo, newPeople);
      }
  
      if (mutualFriends) {
        newPeople = filterByMutualFriends(newPeople);
      }

      setFilteredPeople(newPeople);
      const newSearchedPeople = search(newPeople, searchQuery);
      setFilteredSearchPeople(newSearchedPeople);
    }

    if (people.length > 0) {
      filter().then(() => {
        setLoading(false);
      });
    }
  }, [similarInterests, mutualFriends]);

  // Method to filter out people based on name, username, or tags
  const search = (newPeople, text) => {
    return newPeople.filter((p) => isMatch(p, text));
  };

  // Determines if a person matches the search query or not
  const isMatch = (person, text) => {
    // Name
    const fullName = person.firstName + " " + person.lastName;
    if (fullName.toLowerCase().includes(text.toLowerCase())) {
      return true;
    }

    // Username
    if (person.username.toLowerCase().includes(text.toLowerCase())) {
      return true;
    }

    // Tags
    return person.tags.some((tag) =>
      tag.tag.toLowerCase().includes(text.toLowerCase())
    );
  };

  // Method called when a new query is typed in/deleted
  const onChangeText = (text) => {
    setSearchQuery(text);
    const searchedPeople = search(filteredPeople, text);
    const newPeople = searchedPeople.filter(person => (person.settings.privateAccount == null || (!person.settings.privateAccount || text === person.username)))
    setFilteredSearchPeople(newPeople);
  };

  // Display people who are mutual friends
  const filterByMutualFriends = (newPeople) => {
    return newPeople.filter((p) => mutuals.includes(p.id));
  };

  return (
    <Layout>
      <Header name="Explore" navigation={navigation} hasNotif={unread} notifs/>
      <HorizontalSwitch
        left="Meals"
        right="People"
        current="right"
        press={() => navigation.navigate("Explore")}
      />

      <View style={{ paddingHorizontal: 20 }}>
        <Searchbar
          placeholder="Search by name, username, or tags"
          value={searchQuery}
          onChangeText={onChangeText}
        />

        {user.uid !== tryoutId && <HorizontalRow>
          <Filter
            checked={similarInterests}
            onPress={() => setSimilarInterests(!similarInterests)}
            text="Sort by similar interests"
          />
          <Filter
            checked={mutualFriends}
            onPress={() => setMutualFriends(!mutualFriends)}
            text="Mutual friends"
          />
        </HorizontalRow>}
      </View>

      <View style={{ flex: 1, alignItems: "center" }}>
        {loading || people.length === 0 ?
          <LoadingView/>
        : filteredSearchedPeople.length > 0 ? 
          <FlatList
            contentContainerStyle={styles.people}
            keyExtractor={(item) => item.id}
            data={filteredSearchedPeople}
            renderItem={({ item }) => (
              <ProfileBubble
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
          <EmptyState title="Empty" text="Either you're friends with everyone or no one is using the app :("/>
        }
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  people: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20
  }
})