import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";

import firebase from "firebase/compat";
import { auth, db } from "../provider/Firebase";
import TagsList from "./TagsList";

const MessageList = props => {
  const user = auth.currentUser;
  const person = props.person || {};

  return (
    
      <TouchableOpacity onPress={props.click}>
        <View style={[styles.head, {
          backgroundColor: props.color,
          width: props.width ? props.width : Dimensions.get('screen').width - 40
        }]}>

          {/* avatar */}
          <Image style={styles.image} source={{ uri: person.profile }} />

          {/* left block: username (takes remaining space) */}
          <View style={styles.headleft}>
            <MediumText style={styles.username}>
              {person.username
                ? (person.username.length > 14 ? person.username.substring(0, 14) + "..." : person.username)
                : "Unknown"}
            </MediumText>
            <View style={styles.tags}>
                <TagsList tags={Array.isArray(person.tags) ? person.tags.slice(0, 3) : []} left={true} />
            </View>
          </View>

          {/* tags as a sibling (constrained so it doesn't overlap icons) */}
          

          {/* actions */}
          <View style={styles.response}>
            <TouchableOpacity onPress={() => {
              db.collection("User Invites").doc(user.uid).collection("Connections").doc(person.id).delete().then(() => {
                alert("Request Declined");
              }).catch(() => {
                alert("Couldn't delete request, try again later.");
              });
            }}>
              <Ionicons name="close-circle-outline" size={40} color="#EA3323" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              const cur = firebase.auth().currentUser;
              db.collection("Usernames").doc(person.username).get().then((doc) => {
                if (!doc.exists) return alert("This user seems to no longer exist :(");
                const otherId = doc.data().id;
                db.collection("Users").doc(cur.uid).update({
                  friendIDs: firebase.firestore.FieldValue.arrayUnion(otherId)
                }).then(() => {
                  db.collection("Users").doc(otherId).update({
                    friendIDs: firebase.firestore.FieldValue.arrayUnion(cur.uid)
                  }).then(() => {
                    db.collection("User Invites").doc(cur.uid).collection("Connections").doc(otherId).delete().then(() => {
                      if (props.delete) props.delete(person.id);
                      alert("Taste Bud Added");
                    });
                  });
                });
              }).catch(() => alert("This user seems to no longer exist :("));
            }}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#5DB075" />
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableOpacity>
    
  );
}

const styles = StyleSheet.create({
    // outline: {
    //     marginVertical: 5,
    //     paddingVertical: 5,
    //     shadowOpacity: 0.25,
    //     shadowOffset: { width: 0, height: 4 },
    //     elevation: 10,
    //     borderRadius: 8,
    // },
    head: {
        flexDirection: "row",
        
        
        paddingHorizontal: 5,
    },
    headleft: {
        flexDirection: "row",
        marginRight: 8,
        marginTop: 10
    },
    image: {
        width: 52,
        height: 52,
        borderRadius: 26,
        marginRight: 20,
        borderWidth: 1.5,
        borderColor: "black",
        marginTop: 10

    },
    username: {
        margin: 0,
        marginBottom: 6,
        fontWeight: "600",
        marginTop: 3
    },
    tags: {
        position: "absolute",
        left: -5,           // 👈 always 50px from left edge
        transform: [{ scale: 0.55 }],
        transformOrigin: "left",
        marginTop: 10
    },
    response: {
        position: "absolute",
        right: 5,        // 👈 always 10px from the right wall
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
});

export default MessageList;
