import React from "react";
import { View, StyleSheet } from "react-native";
import SendBuddyRequestCard from "../components/SendBuddyRequestCard";

const SendBuddyRequest = ({ route, navigation }) => {
  const { user } = route.params; // Get user data passed from Me.js

  return (
    <View style={styles.container}>
      <SendBuddyRequestCard
        user={user}
        onSend={() => {
          console.log("Buddy request sent!");
          navigation.goBack(); // Go back after sending
        }}
        onCancel={() => navigation.goBack()} // Close screen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});

export default SendBuddyRequest;
