import React, { useState } from "react";
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import NormalText from "./NormalText";

const EventDropdown = ({ visible, onClose }) => {
  // State for managing dropdown visibility and selected option
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // List of event options
  const eventList = [
    "Meetup at Sunright Tea Studio",
    "Meetup at Chipotle",
    "Meetup at Yu Sushi & Katsu",
    "Meetup at Jewel of India",
  ];

  // Handler for selecting an option from the dropdown
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  // Handler for confirming the selected option
  const handleConfirm = () => {
    console.log("Selected Option:", selectedOption);
    // Add further logic here for handling the confirmed option
  };

  // Renderer for individual dropdown options
  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownOption}
      onPress={() => handleOptionSelect(item)}
    >
      <NormalText style={styles.dropdownOptionText}>{item}</NormalText>
    </TouchableOpacity>
  );

  return (
    // Modal for displaying the dropdown
    <Modal visible={visible} transparent={true} animationType="fade">
      {/* Background TouchableOpacity to close the modal */}
      <TouchableOpacity style={styles.modalBackground} onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Close button for the modal */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-outline" size={24} color="black" />
          </TouchableOpacity>
          {/* Title of the modal */}
          <NormalText style={styles.title}>Assign photo to an event</NormalText>
          {/* Dropdown button */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <NormalText style={styles.dropdownText}>
              {selectedOption || "Select from your attended events"}
            </NormalText>
            {/* Dropdown icon */}
            <Ionicons
              name={isDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
          {/* Dropdown list */}
          {isDropdownOpen && (
            <FlatList
              data={eventList}
              renderItem={renderOption}
              keyExtractor={(item) => item}
              style={styles.dropdownList}
            />
          )}
          {/* Spacer */}
          <View style={styles.spacer} />
          {/* Confirm button */}
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <NormalText style={styles.confirmButtonText}>Confirm</NormalText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    width: "80%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: "gray",
  },
  dropdownOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownOptionText: {
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginTop: 5,
  },
  spacer: {
    marginVertical: 10,
  },
  confirmButton: {
    backgroundColor: "#5DB075",
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 10,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
});

export default EventDropdown;
