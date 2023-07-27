import React from "react";
import { Ionicons } from "@expo/vector-icons";

const NotifIcon = (props) => {
  let iconName;

  //Choose either regular mail or mail with notif
  if (props.hasNotif) {
    iconName = "notifications-circle";
  } else {
    iconName = "notifications";
  }

  return (
    <Ionicons
      name={iconName}
      size={40}
      color="black"
      style={{ marginRight: 5 }}
    />
  );
};

export default NotifIcon;
