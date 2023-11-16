import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NotifIcon = (props) => {
  let iconName;

  // Choose either regular bell or bell with badge for notification
  if (props.hasNotif) {
    iconName = "bell-badge-outline";
  } else {
    iconName = "bell-outline";
  }

  return (
    <MaterialCommunityIcons
      name={iconName}
      size={30}
      color="black"
      style={{ marginRight: 5 }}
    />
  );
};

export default NotifIcon;
