import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Layout, TopNav } from 'react-native-rapi-ui';
import MediumText from '../../components/MediumText';
import InvitePerson from "../../components/InvitePerson";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from '../../components/EmptyState';
import Searchbar from "../../components/Searchbar";
import SmallText from '../../components/SmallText';

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";


export default function ({ navigation, route })  {

  const [friends, setFriends] = useState([]);

  const user = firebase.auth().currentUser;

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
                bio: data.bio || ""
              });
            })
            .then(() => {
              setFriends(friendsList);
            });
          });
      }
    });

  }, []);

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
          placeholder="Search by name, username, or tags"
      />
      <SmallText>Suggested</SmallText>
      <FlatList
        contentContainerStyle={styles.friendsList} // Adds padding/margin
        data={friends} // The array to display
        keyExtractor={(item) => item.id} // Unique key required by FlatList
        renderItem={({ item }) => (
          <InvitePerson
            navigation={navigation} // Passed down for potential navigation
            person={item} // Contains: id, username, name, hasImage, pictureID
            toggleInvite={() => {}} // Stub function; replace with real logic if needed
          />
        )}
        ListEmptyComponent={<EmptyState title="No Friends Found" text="Try adding some friends!" />} // Optional empty state
      />
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
});
