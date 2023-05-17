import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal } from "react-native";
import firebase from "firebase/compat";
import NormalText from "./NormalText";
import moment from "moment";
import getDate from "../getDate";
import getTime from "../getTime";

const TextMessage = (props) => {
  const user = firebase.auth().currentUser;
  const messageDate = moment.unix(props.sentAt).toDate();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={props.sentBy == user.uid ? styles.you : styles.other} borderRadius={20}>
      {props.sentName && <NormalText color="#666666" size={12}>{props.sentName}</NormalText>}
      <NormalText color="#666666" size={12}>{getDate(messageDate, false)}, {getTime(messageDate)}</NormalText>
      {props.url && (
        <TouchableOpacity onPress={handleImagePress}>
          <Image
            source={{ uri: props.url }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      {!props.url && <NormalText color="white" size={16}>{props.message}</NormalText>}

      <Modal visible={isModalVisible} transparent={true}>
        <TouchableOpacity style={styles.modalContainer} onPress={handleCloseModal}>
          <Image
            source={{ uri: props.url }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  you: {
    backgroundColor: "#5db075",
    borderRadius: 20,
    marginHorizontal: 30,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-end",
    maxWidth: 200,
  },
  other: {
    backgroundColor: "#C0C0C0",
    borderRadius: 20,
    marginHorizontal: 30,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
    maxWidth: 200,
  },
  image: {
    borderRadius: 20,
    marginVertical: 10,
    width: 150,
    height: 150,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalImage: {
    width: "50%",
    height: "50%",
    aspectRatio: 1,
  },
});

export default TextMessage;

