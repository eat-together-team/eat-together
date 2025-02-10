import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Section, SectionContent, SectionImage } from "react-native-rapi-ui";
import MediumText from "./MediumText";
import SmallText from "./SmallText";
import NormalText from "./NormalText";

const SendBuddyRequestCard = ({ user, onSend, onCancel }) => {
  return (
    <Section style={styles.card} borderRadius={20}>
      <SectionContent>
        {/* Header */}
        <View style={styles.header}>
          <MediumText size={18}>Send Buddy Request</MediumText>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={
              user.hasImage
                ? { uri: user.image }
                : require("../../assets/logo.png")
            }
          />
          <View style={styles.profileDetails}>
            <MediumText>{user.firstName} {user.lastName}</MediumText>
            <SmallText color="#4C6FB1">View profile</SmallText>
          </View>
        </View>

        {/* Tags and Info */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <SmallText color="white">Grad Student</SmallText>
          </View>
          <View style={styles.tagBlue}>
            <SmallText color="white">Tennis</SmallText>
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageBox}>
          <NormalText>Hello {user.firstName}.</NormalText>
          <TextInput
            style={styles.messageInput}
            multiline
            defaultValue="I’m sending this request because I would like to become your buddy! Please accept my request!"
          />
          <SmallText color="gray" style={styles.editText}>Edit message</SmallText>
        </View>

        {/* Note */}
        <SmallText color="gray" center>
          Note: Becoming a buddy does not mean connecting (friends on the app).
          This pairs users for future events.
        </SmallText>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <MediumText color="white">Close</MediumText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sendButton} onPress={onSend}>
            <MediumText color="white">Send</MediumText>
          </TouchableOpacity>
        </View>
      </SectionContent>
    </Section>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    width: Dimensions.get("window").width - 40,
    backgroundColor: "white",
    padding: 10,
  },

  header: {
    alignItems: "center",
    marginBottom: 10,
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },

  profileDetails: {
    flexDirection: "column",
  },

  tagsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  tag: {
    backgroundColor: "#F4D03F",
    padding: 5,
    borderRadius: 10,
    marginRight: 5,
  },

  tagBlue: {
    backgroundColor: "#5DADE2",
    padding: 5,
    borderRadius: 10,
  },

  messageBox: {
    backgroundColor: "#F8F9F9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  messageInput: {
    marginTop: 5,
    minHeight: 50,
    textAlignVertical: "top",
  },

  editText: {
    marginTop: 5,
    textAlign: "right",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },

  sendButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
});

export default SendBuddyRequestCard;
