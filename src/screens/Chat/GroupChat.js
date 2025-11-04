import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Layout, TopNav } from 'react-native-rapi-ui';
import MediumText from '../../components/MediumText';
import InvitePerson from "../../components/InvitePerson";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from '../../components/EmptyState';
import Searchbar from "../../components/Searchbar";
import SmallText from '../../components/SmallText';
import Button from "../../components/Button";
import { createNewChat } from "../Chat/Chats";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";


export default function ({ navigation, route })  {

  const [allFriends, setAllFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const user = firebase.auth().currentUser;


  // Fetch friends from Firebase
  useEffect(() => {
    if (!user) return;

    db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {

        const friends = doc.data().friendIDs;
        const friendsList = [];

        friends.forEach((uid) => {
          db.collection("Users")
            .doc(uid)
            .get()
            .then((doc) => {
              let data = doc.data();
              friendsList.push({
                id: data.id,
                username: data.username,
                name: data.firstName + " " + data.lastName,
                firstName: data.firstName,
                lastName: data.lastName,
                hasImage: data.hasImage,
                pictureID: data.id,
                selectedTags: data.selectedTags || [],
                bio: data.bio || "",
                selected: false,
                settings: { banner: "#5DB075" }
              });
            })
            .then(() => {
              setAllFriends(friendsList);
              setFriends(friendsList);
            });
          });
      }
    });

  }, []);

  // Function to toggle users selected/deselect friends
  const toggleSelection = (id) => {
    const updated = [...friends];
    const index = updated.findIndex((user) => user.id === id);
    updated[index].invited = !updated[index].invited;
    setFriends(updated);
  }

  // Enable/Disable Create Groupchat button based on selection
  useEffect(() => {
    const selected = friends.filter((u) => u.invited);
    setDisabled(selected.length === 0);
  }, [friends]);

  // New chat
  const handleCreateChat = async () => {
    // Get all invited friends
    const selected = friends.filter((u) => u.invited);
    if (selected.length === 0) return;

    // Collect all user IDs (invited + current user)
    const selectedIDs = selected.map((u) => u.id);
    const allUserIDs = [...selectedIDs, user.uid];

    // Get the current user’s info from Firestore
    const userDoc = await db.collection("Users").doc(user.uid).get();
    const currentUserName = userDoc.data().firstName + " " + userDoc.data().lastName;

    // Build a readable group name from all members’ names
    const allNames = selected.map((u) => u.name);
    const chatName = [...allNames, currentUserName].join(", ");

    // Create a unique chatID (sorted list of all user IDs)
    const chatID = allUserIDs.sort().join("-");

    // Create the chat in Firestore
    await createNewChat(allUserIDs, chatID, chatName, true);

    // Navigate to the chat room
    navigation.navigate("ChatRoom", {
      group: {
        groupID: chatID,
        uids: allUserIDs,
        name: chatName,
        messages: [],
      },
    });
  };

  // Handle Searching
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text) => {
    const query = text.trim().toLowerCase();
    setSearchQuery(text);
    const filtered = allFriends.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase())
    );
    setFriends(filtered);
  };

  return (
    <Layout>
        <TopNav
          middleContent={
              <MediumText center>New Message</MediumText>
          }
          leftContent={
              <Ionicons
                  name="chevron-back"
                  size={20}
              />
          }
          leftAction={() => navigation.goBack()}
      />
      <Searchbar
          style={styles.searchbar}
          placeholder="Search Connections"
          value={searchQuery}
          onChangeText={handleSearch}
      />
      <SmallText style={{ marginLeft: 25 }}>Suggested</SmallText>
      <FlatList
        contentContainerStyle={styles.friendsList} // Adds padding/margin
        data={friends} // The array to display
        keyExtractor={(item) => item.id} // Unique key required by FlatList
        renderItem={({ item }) => (
          <InvitePerson
            navigation={navigation} // Passed down for potential navigation
            person={item} // Contains: id, username, name, hasImage, pictureID
            toggleInvite={toggleSelection} // Selects users for new chat
          />
        )}
        ListEmptyComponent={<EmptyState title="No Friends Found" text="Try adding some friends!" />} // Optional empty state
      />
      <Button disabled={disabled} onPress={handleCreateChat}>
        Create Group
      </Button>
      {/* <EmptyState title="No Requests" text="You look great today :)"/> */}
    </Layout>
  );
}

const styles = StyleSheet.create ({
  friendsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  searchbar: {
    alignSelf: "center",
    width: "94%",
    height: 40,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#F7F7F7",

    // Shadow (for iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});
