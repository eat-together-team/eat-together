import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Layout, TopNav } from '../../rapi_ui_components';
import MediumText from '../../components/MediumText';
import InvitePerson from "../../components/InvitePerson";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from '../../components/EmptyState';
import Searchbar from "../../components/Searchbar";
import SmallText from '../../components/SmallText';
import Button from "../../components/Button";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";


export default function ({ navigation, route })  {

  const [allFriends, setAllFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [disabled, setDisabled] = useState(true);
  const [groups, setGroups] = useState([]);
  const user = firebase.auth().currentUser;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for the page

  const createNewChatDefault = () => {
    console.log('entering create new default')
    console.log(friends)
    // Generate group id using the concatenation of all the selected usernames
    let allUsernames = [];
    let allNames = [];

    selectedUsers.map((user) => {
      allUsernames.push(user.username);
      allNames.push(user.name);
    });

    allUsernames.push(userInfo.username);
    allNames.push(userInfo.firstName + " " + userInfo.lastName);
    const chatID = allUsernames.sort().join();

    // Get all the uid in this chat
    let allUIDs = [];
    selectedUsers.map((user) => {
      allUIDs.push(user.id);
    });
    allUIDs.push(user.uid);

    // Create a new doc in the groups collection on firestore
    db.collection("Groups")
      .doc(chatID)
      .set({
        uids: allUIDs,
        name: allNames.join(", "),
        messages: [],
      });

    // Update each user's data to include this chat
    allUIDs.map((uid) => {
      db.collection("Users")
        .doc(uid)
        .update({
          groupIDs: firebase.firestore.FieldValue.arrayUnion(chatID),
        });
    });

    let name = allNames.join(", ");
    let currUserName = userInfo.firstName + " " + userInfo.lastName
    if(allUIDs.length >= 2) {
      name = name.replace(currUserName + ", ", "");

      if (name.endsWith(", " + currUserName)) {
        name = name.slice(0, -1 * (currUserName.length + 2));
      }
    }

    navigation.navigate("ChatRoom", {
      group: {
        groupID: chatID,
        uids: allUIDs,
        name,
        messages: [],
      },
    });
  };
  


  useEffect(() => {
    if (!user) return;

    db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      if (doc.exists) {
        setUserInfo(doc.data());
        const nameCurrent = userInfo ? userInfo.firstName + " " + userInfo.lastName : "";
        const friends = doc.data().friendIDs;
        const friendsList = [];

        // update the groups displayed
        const groups = doc.data().groupIDs;
        let temp = [];
        let lenGroups = groups.length;

        groups.forEach((groupID) => {
          db.collection("Groups")
            .doc(groupID)
            .get()
            .then((doc) => {
              // now store all the chat rooms
              let data = doc.data();
              // store most recent message in variable
              let message = "";
              let unread = false;
              if (data.messages.length > 0) {
                const lastMessage = data.messages[data.messages.length - 1];
                message = lastMessage.message;
                if (lastMessage.unread && lastMessage.sentBy !== user.uid) {
                  unread = lastMessage.unread.filter(u => u.uid === user.uid)[0].unread;
                }
              }

              let time =
                data.messages.length != 0
                  ? data.messages[data.messages.length - 1].sentAt
                  : "";

              // // Get rid of your own name and all the ways it can be formatted in group title (if it is a DM)
              let name = data.name;
              if (data.uids.length >= 2) {
                name = name.replace(nameCurrent + ", ", "");
                if (name.endsWith(", " + nameCurrent)) {
                  name = name.slice(0, -1 * (nameCurrent.length + 2));
                }
              }

              temp.push({
                groupID: groupID,
                name: name,
                uids: data.uids,
                hasImage: data.hasImage,
                message: message,
                unread: unread,
                time: time,
                pictureID: data.id,
              });
            })
            .then(() => {
              lenGroups--;
              if (lenGroups === 0) {
                // sort display by time
                temp.sort((a, b) => {
                  return b.time - a.time;
                });
                setGroups(temp);
              }
            });
        });
        // Fetch friends from Firebase
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
              // Map over fetched friends and keep previously invited state
              const mergedFriends = friendsList.map(f => {
                const existing = friends.find(e => e.id === f.id);
                return {
                  ...f,
                  invited: existing ? existing.invited : false, // keep selection if it exists
                };
              });
              setAllFriends(mergedFriends);
              setFriends(mergedFriends);
            });
        });
        setLoading(false);
      }
    });

  }, []);

  // Function to check if new chat already exists or not
  const checkChatExists = () => {
    if (!user) return false; // guard
    if (!selectedUsers || selectedUsers.length === 0) return false;

    console.log(groups,"group")
    return groups.some((group) => {
      if (group.uids.length != selectedUsers.length + 1) {
        return false;
      }

      // Comparing the two uid arrays
      const groupIDs = group.uids.filter((uid) => uid != user.uid).sort();
      const selectedIDs = selectedUsers.map((user) => user.id).sort();

      for (let i = 0; i < groupIDs.length; i++) {
        if (groupIDs[i] != selectedIDs[i]) {
          return false;
        }
      }

      return true;
    });
  }
  

  // Function to toggle users selected/deselect friends
  const toggleSelection = (id) => {
    const updated = friends.map(user =>
      user.id === id
        ? { ...user, invited: !user.invited }
        : user
    );
    setFriends(updated);

    const selected = updated.filter(user => user.invited);
    console.log(selected, "selected");
    setSelectedUsers(selected)

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
    await createNewChatDefault();

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
      <Button disabled={disabled} onPress={() => {                        
        if(checkChatExists()) {
          alert("Chat already exists!");
        } else {
          handleCreateChat();
        }
      }}>
        Create Group
      </Button>
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
