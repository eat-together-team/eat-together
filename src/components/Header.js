import React from "react";
import {View, StyleSheet, TouchableOpacity, Alert} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth} from "../provider/Firebase";

import LargeText from "./LargeText";
import NotifIcon from "./NotifIcon";
import {tryoutId} from "../constants";

const Header = (props) => {
  const user = auth.currentUser;
  return (
    <View style={styles.header}>
      <LargeText>{props.name}</LargeText>
      <View style={styles.icons}>
        {props.connections && props.navigation && <TouchableOpacity onPress={() => {
          props.navigation.navigate("Requests");
        }}>
          <Ionicons name="people-circle-outline" size={30} color="black" style={{ marginRight: 5 }}/>
        </TouchableOpacity>}
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
