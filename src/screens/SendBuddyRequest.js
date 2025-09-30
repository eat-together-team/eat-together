import React, { useState } from "react";
import { View, StyleSheet, Modal, Text, TouchableOpacity } from "react-native";
import SendBuddyRequestCard from "../components/SendBuddyRequestCard";

const SendBuddyRequest = ({ route, navigation }) => {
  const { user } = route.params; // Get user data passed from Me.js
  const [modalVisible, setModalVisible] = useState(false);

  const handleSendRequest = () => {
    setModalVisible(true);
    console.log("Buddy request sent!");

    // Auto-dismiss the modal after 2 seconds
    setTimeout(() => {
      setModalVisible(false);
      navigation.goBack(); // Navigate back after closing the modal
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <SendBuddyRequestCard
        user={user}
        onSend={handleSendRequest}
        onCancel={() => navigation.goBack()} // Close screen
      />

      {/* "Request Sent!" Pop-up Modal */}
      <Modal transparent={true} visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Request Sent!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack(); // Navigate back after closing manually
              }}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Dark background for contrast
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeText: {
    color: "white",
    fontSize: 16,
  },
});

export default SendBuddyRequest;

// This component sends a buddy request to the user and displays a "Request Sent!" pop-up modal.