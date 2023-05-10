//Display upcoming events to join

import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Dimensions, ActivityIndicator } from "react-native";

import { db, auth, storage } from "../../provider/Firebase";
import { TopNav, Layout } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import firebase from "firebase/compat";

import Button from "../../components/Button";
import MediumText from "../../components/MediumText";
import InvitePerson from "../../components/InvitePerson";
import Searchbar from "../../components/Searchbar";
import HorizontalRow from "../../components/HorizontalRow";
import Filter from "../../components/Filter";

import { sortBySimilarInterests, generateColor, isAvailable, randomize3 } from "../../methods";
import { createNewChat } from "../Chat/Chats";

// Stores image in Firebase Storage
const storeImage = async (uri, event_id) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  let ref = storage.ref().child("eventPictures/" + event_id);
  return ref.put(blob);
};

// Fetches image from Firebase Storage
const fetchImage = async (id) => {
  let ref = storage.ref().child("eventPictures/" + id);
  return ref.getDownloadURL();
};

// Send invites to the selected user
async function sendInvitation(ref, invite, user, id) {
  await ref
    .collection("Invites")
    .add({
      type: invite.type,
      startDate: invite.startDate,
      endDate: invite.endDate,
      description: invite.additionalInfo,
      hostID: user.id,
      hostFirstName: user.firstName,
      hostLastName: user.lastName,
      hasImage: invite.hasImage,
      image: invite.image,
      hasHostImage: user.hasImage,
      hostImage: user.image,
      location: invite.location,
      name: invite.name,
      inviteID: id,
    })
    .then((r) => {
      invite.clearAll();
    });
}

async function sendInvites(
  attendees,
  invite,
  navigation,
  user,
  id,
  image,
  icebreakers,
  clearAll
) {
  // Create the event in the database
  const chatID = String(invite.startDate) + invite.name;
  let table = "Private Events";
  if (invite.type === "public") {
    table = "Public Events";
  }

  await db
    .collection(table)
    .doc(id)
    .set({
      id,
      name: invite.name,
      hostID: user.id,
      hostFirstName: user.firstName,
      hostLastName: user.lastName,
      hasHostImage: user.hasImage,
      hostImage: user.image,
      location: invite.location,
      startDate: invite.startDate,
      endDate: invite.endDate,
      additionalInfo: invite.additionalInfo,
      ice: icebreakers,
      attendees: [user.id], //ONLY start by putting the current user as an attendee
      hasImage: invite.hasImage,
      image,
      chatID: chatID
    })
    .then(async (docRef) => {
      await attendees.forEach((attendee) => {
        const ref = db.collection("User Invites").doc(attendee.id);
        ref.get().then(async (docRef) => {
          if (attendee !== user.id) {
            await sendInvitation(ref, invite, user, id);
          }
        });
      });

      const storeID = {
        type: invite.type, // There can be different private events
        id,
      };

      await db
        .collection("Users")
        .doc(user.id)
        .update({
          hostedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
          attendingEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
          attendedEventIDs: firebase.firestore.FieldValue.arrayUnion(storeID),
        });

      // Create the in-event group chat
      let userIDs = attendees.map(attendee => attendee.id);
      userIDs.push(user.id);
      createNewChat(userIDs, chatID, invite.name, false);
      
      navigation.goBack();
      clearAll();
      alert("Invitations sent! Make sure to do attendance when the meal starts!");
    });
}

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

////////////////////////
// COMPONENT STARTS HERE
////////////////////////
export default function ({ route, navigation }) {
  // Current user
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState([]);

  // Other users
  const [users, setUsers] = useState([]); // All users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users
  const [filteredSearchedUsers, setFilteredSearchedUsers] = useState([]); // Users that are filtered and search-queried

  // Disable button or not
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Filters
  const [curSearch, setCurSearch] = useState("");
  const [available, setAvailable] = useState(true);
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [similarInterests, setSimilarInterests] = useState(false);
  const [mutualFriends, setMutualFriends] = useState(false);

  const [mutuals, setMutuals] = useState([]); // Mutual friends
  const [loadingScreen, setLoadingScreen] = useState(true); // Loading screen for filter calculations

  // Fetch users
  useEffect(async () => {
    async function fetchData() {
      // Fetch users
      const ref = db.collection("Users");

      // Current user
      let currUser;
      await ref.doc(user.uid).get().then((doc) => {
        currUser = doc.data();
        setUserInfo(currUser);

        currUser.friendIDs.forEach((id) => { // Fetching mutual friends
          db.collection("Users")
            .doc(id)
            .get()
            .then((doc) => {
              if (doc) {
                if (doc.data().friendIDs) {
                  setMutuals((mutuals) =>
                    mutuals.concat(doc.data().friendIDs)
                  );
                }
              }
            });
        });
      });

      // Fetch other users
      await ref.onSnapshot((query) => {
        const list = [];
        query.forEach((doc) => {
          let data = doc.data();
          if (data.verified && data.id !== user.uid && !route.params.attendees.includes(data.id) && !currUser.blockedIDs.includes(data.id) && !data.blockedIDs.includes(user.uid) && (!data.settings.privateAccount || currUser.friendIDs.includes(data.id))) { // Only show verified + unblocked + nonprivate users
            data.invited = false;
            data.color = generateColor();
            data.selectedTags = randomize3(data.tags);
            list.push(data);
          }
        });

        setUsers(list);
        setFilteredUsers(filterByAvailability(list));
        setFilteredSearchedUsers(filterByAvailability(list));
      });
    }

    fetchData().then(() => setLoadingScreen(false));
  }, []);

  // Filters
  useEffect(() => {
    async function filter() {
      let newUsers = [...users];
  
      if (similarInterests) {
        newUsers = await sortBySimilarInterests(userInfo, newUsers);
      }

      if (available) {
        newUsers = filterByAvailability(newUsers);
      }

      if (friendsOnly) {
        newUsers = filterByFriendsOnly(newUsers);
      }
  
      if (mutualFriends) {
        newUsers = filterByMutualFriends(newUsers);
      }

      setFilteredUsers(newUsers);

      const newSearchedUsers = search(newUsers, curSearch);
      setFilteredSearchedUsers(newSearchedUsers);
    }

    setLoadingScreen(true);
    filter().then(() => {
      setLoadingScreen(false);
    });
  }, [similarInterests, available, friendsOnly, mutualFriends]);

  // Disabling/undisabling the invite button
  useEffect(() => {
    const invitedUsers = users.filter((user) => user.invited);
    setDisabled(invitedUsers.length === 0);
  }, [users]);

  // Toggle a user's invite status
  const toggleInvite = (id) => {
    const newUsers = [...users];
    const newFilteredUsers = [...filteredUsers];
    const newFilteredSearchedUsers = [...filteredSearchedUsers];

    const index = newUsers.findIndex((user) => user.id === id);
    newUsers[index].invited = !newUsers[index].invited;

    const index2 = newFilteredUsers.findIndex((user) => user.id === id);
    newFilteredUsers[index2].invited = !newFilteredUsers[index2].invited;

    const index3 = newFilteredSearchedUsers.findIndex((user) => user.id === id);
    newFilteredSearchedUsers[index3].invited = !newFilteredSearchedUsers[index3].invited;

    setUsers(newUsers);
    setFilteredUsers(newFilteredUsers);
    setFilteredSearchedUsers(newFilteredSearchedUsers);
  }

  // For searching
  const onChangeText = (text) => {
    setCurSearch(text);
    const newUsers = search(filteredUsers, text);
    setFilteredSearchedUsers(newUsers);
  };

  const search = (newUsers, text) => {
    return newUsers.filter((e) => isMatch(e, text));
  };

   // Filtering by people who are available to the event or not
   const filterByAvailability = (newUsers) => {
    return newUsers.filter(u => isAvailable(u, route.params));
  }

  // Display friends only
  const filterByFriendsOnly = (newUsers) => {
    return newUsers.filter(u => userInfo.friendIDs.includes(u.id));
  }

  // Display people who are mutual friends
  const filterByMutualFriends = (newUsers) => {
    return newUsers.filter((p) => mutuals.includes(p.id));
  };

  return (
    <Layout style={{ flex: 1 }}>
      <TopNav
        middleContent={<MediumText center>Suggested People</MediumText>}
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => navigation.goBack()}
      />

      <View style={{ padding: 20 }}>
        <Searchbar
          placeholder="Search by name, username, or tags"
          value={curSearch}
          onChangeText={onChangeText}
        />

        <HorizontalRow>
          <Filter
            checked={available}
            onPress={() => setAvailable(!available)}
            text="Is available"
          />
          <Filter
            checked={friendsOnly}
            onPress={() => setFriendsOnly(!friendsOnly)}
            text="Friends only"
          />
          <Filter
            checked={similarInterests}
            onPress={() => setSimilarInterests(!similarInterests)}
            text={"Sort by similar interests"}
          />
          <Filter
            checked={mutualFriends}
            onPress={() => setMutualFriends(!mutualFriends)}
            text="Mutual friends"
          />
        </HorizontalRow>
      </View>

      {loadingScreen || users.length === 0 ?
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size={100} color="#5DB075" />
          <MediumText center>Hang tight ...</MediumText>
        </View>
        : filteredSearchedUsers.length > 0 ? (<FlatList
          contentContainerStyle={styles.invites}
          keyExtractor={(item) => item.id}
          data={filteredSearchedUsers}
          renderItem={({ item }) => (
            <InvitePerson
              navigation={navigation}
              person={item}
              toggleInvite={toggleInvite}
            />
          )}
        />)
        : (<View style={{ flex: 1, justifyContent: "center" }}>
          <MediumText center>Empty 🍽️</MediumText>
        </View>)}

      <Button
        disabled={disabled || loading}
        onPress={() => {
          setLoading(true);

          // Check which page the user came from (WhileYouEat or Organize)
          if (route.params.from === "WhileYouEat") {
            users.filter((user) => user.invited).forEach((attendee) => {
              const ref = db.collection("User Invites").doc(attendee.id);
              ref.get().then(async (docRef) => {
                if (attendee !== user.id) {
                  await sendInvitation(ref, route.params, userInfo, route.params.id);
                }
              });
            });

            navigation.goBack();
            alert("Invitations sent! Make sure to do attendance when the meal starts!");
          } else {
            let id = Date.now() + user.uid; // Generate a unique ID for the event

            if (route.params.hasImage) {
              storeImage(route.params.image, id).then(() => {
                fetchImage(id).then((uri) => {
                  sendInvites(
                    users.filter((user) => user.invited),
                    route.params,
                    navigation,
                    userInfo,
                    id,
                    uri,
                    route.params.icebreakers,
                    route.params.clearAll
                  ).then(() => {
                    setLoading(false);
                  });
                });
              });
            } else {
              sendInvites(
                users.filter((user) => user.invited),
                route.params,
                navigation,
                userInfo,
                id,
                "",
                route.params.icebreakers,
                route.params.clearAll
              ).then(() => {
                setLoading(false);
              });
            }
          }
        }}
      >{loading ? "Sending ..." : "Send Invites"}</Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  invites: {
    alignItems: "center",
  },
  submit: {
    position: "absolute",
    bottom: 0,
  },
  tagInput: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },

  input: {
    width: Dimensions.get("screen").width / 1.5,
    marginRight: 10,
  },
});
