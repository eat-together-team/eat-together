import React from "react";
import {View, StyleSheet, TouchableOpacity, Alert} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth} from "../provider/Firebase";
import { Octicons } from '@expo/vector-icons';

import LargeText from "./LargeText";
import NotifIcon from "./NotifIcon";
import {tryoutId} from "../constants";

const Header = (props) => {
  const user = auth.currentUser;
  return (
    <View style={styles.header}>
      <LargeText>{props.name}</LargeText>
      <View style={styles.icons}>
        // Navigates to the 'Requests' screen if the user has connections and navigation is enabled.
        // This button is rendered only when the 'connections' prop is true, indicating the user can navigate to see connection requests.
        {props.connections && props.navigation && <TouchableOpacity onPress={() => {
          props.navigation.navigate("Requests");
        }}>
          <Ionicons name="people-circle-outline" size={30} color="black" style={{ marginRight: 5 }}/>
        </TouchableOpacity>}
        // Navigates to the 'Notifications' screen if the user is logged in and has notifications.
        // This button is rendered only when the 'notifs' prop is true. If the user is not logged in (uid matches tryoutId), an alert is shown instead.
        {props.notifs && props.navigation && <TouchableOpacity
          onPress={() => {
            if (user.uid === tryoutId) {
              alert('Please log in to view notifications!');
            } else {
              props.navigation.navigate("Notifications", {
                fromNav: false
              });
            }
          }}
        >
          <NotifIcon hasNotif={props.hasNotif === null ? false : props.hasNotif} />
        </TouchableOpacity>}
        // Navigates to the 'Requests' screen if the user is looking to connect with a buddy.
        // This button is rendered only when the 'buddy' prop is true, indicating the user's intent to find or manage buddy requests.
        {props.buddy && props.navigation && <TouchableOpacity onPress={() => {
          props.navigation.navigate("Requests");
        }}>
          <Octicons name="people" size={30} color="black" />

        </TouchableOpacity>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: -2,
    alignItems: "center",
  },

  icons: {
    flexDirection: "row",
    alignItems: "center",
  }
});

export default Header;
