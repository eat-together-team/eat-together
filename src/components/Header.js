import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth} from "../provider/Firebase";

import LargeText from "./LargeText";
import NotifIcon from "./NotifIcon";

const Header = (props) => {
  const user = auth.currentUser;
  const tryoutId = 'knVtYe1mtpaZ9D8XLDrS7FCImtm2';
  return (
    <View style={styles.header}>
      <LargeText>{props.name}</LargeText>
      <View style={styles.icons}>
        {props.connections && props.navigation && <TouchableOpacity onPress={() => {
          props.navigation.navigate("Requests");
        }}>
          <Ionicons name="people-circle-outline" size={40} color="black" style={{ marginRight: 5 }}/>
        </TouchableOpacity>}
        {props.notifs && props.navigation && <TouchableOpacity
          onPress={() => {
            if (user.uid == tryoutId) {
              alert('Please log in to use this feature!');
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
