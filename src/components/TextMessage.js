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
  // console.log("This is the next msg", props.nextMessage)

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModalth = () => {
    setIsModalVisible(false);
  };

  return (
    <View>
      <View style={props.sentBy == user.uid ? styles.you : styles.other} borderRadius={20}>
        {/* {props.sentName && <NormalText color= {props.sentBy == user.uid ? "#666666" : "#000E08"} size={12}>{props.sentName}</NormalText>}
        <NormalText color="#666666" size={12}>{getDate(messageDate, false)}, {getTime(messageDate)}</NormalText> */}
        {props.url && (
          <TouchableOpacity onPress={handleImagePress}> {/*touchaable opacity -> when click on image*/}
            <Image
              source={{ uri: props.url }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {!props.url && <NormalText color={props.sentBy == user.uid ? "white" : "black"} size={16}>{props.message}</NormalText>}

        {/* // what happens when click on image */}
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

      {/* <NormalText> </NormalText>  this is where I put time and add seperate styles to get it to the side */}
      {/* Time and user matching logic */}
      {<NormalText style={props.sentBy == user.uid ? timeStyle.you : timeStyle.other} color="#666666" size={12}>{getDate(messageDate, false)}, {getTime(messageDate)}</NormalText>}



    </View>
  );
};

const styles = StyleSheet.create({
  you: {
    backgroundColor: "#5db075",
    borderRadius: 20,
    borderTopRightRadius: 0, // made top corner not round 
    marginHorizontal: 30,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-end",
    maxWidth: 200,
  },
  other: {
    backgroundColor: "#FFFFFF", // changed to white background 
    borderRadius: 20,
    borderTopLeftRadius: 0,
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

const timeStyle = StyleSheet.create({
  you: {
    marginHorizontal: 10,
    marginVertical: 0,
    paddingHorizontal: 20,
    paddingVertical: 0,
    alignSelf: "flex-end",
    maxWidth: 200,
  },
  other: {
    marginHorizontal: 10,
    marginVertical: 0,
    paddingHorizontal: 20,
    paddingVertical: 0,
    alignSelf: "flex-start",
    maxWidth: 200,
  },
});

export default TextMessage;

