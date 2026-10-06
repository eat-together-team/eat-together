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

import { auth } from "../provider/Firebase";
import {
  acceptConnectionRequest,
  declineConnectionRequest,
} from "../screens/Connections/connectionRequests";
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
          <Image style={styles.image} source={{ uri: person.profile }} />

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
          
          <View style={styles.response}>
            <TouchableOpacity onPress={() => {
              declineConnectionRequest(user, person.id).then(() => {
                alert("Request Declined");
              }).catch(() => {
                alert("Couldn't delete request, try again later.");
              });
            }}>
              <Ionicons name="close-circle-outline" size={40} color="#EA3323" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {
              acceptConnectionRequest(user, person.id).then(() => {
                if (props.delete) props.delete(person.id);
                alert("Taste Bud Added");
              }).catch(() => alert("Couldn't accept that request, try again later."));
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
        left: -5,
        transform: [{ scale: 0.55 }],
        transformOrigin: "left",
        marginTop: 10
    },
    response: {
        position: "absolute",
        right: 5,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
});

export default MessageList;
