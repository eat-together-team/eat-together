import React, { useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, Modal } from "react-native";
import firebase from "firebase/compat";
import NormalText from "./NormalText";
import moment from "moment";
import getDate from "../getDate";
import getTime from "../getTime";
import { TopNav, Layout } from "react-native-rapi-ui";
import MediumText from "./MediumText";
import { Ionicons } from "@expo/vector-icons";

const TextMessage = (props) => {
  const user = firebase.auth().currentUser;
  const messageDate = moment.unix(props.sentAt).toDate();
  let nextMessageDate = ""
  if(props.nextMessage) {
      nextMessageDate =  moment.unix(props.nextMessage.sentAt).toDate();
      // console.log("nextMsg", getTime(nextMessageDate), "this msg date", getTime(messageDate))
  }
  let prevMessageDate = ""
  if (props.prevMessage) {
    prevMessageDate = moment.unix(props.prevMessage.sentAt).toDate();
  }

  

  
  // console.log("here is the next msg dat", nextMessageDate)
  // console.log("here is the next msg", props.nextMessage)
  const [isModalVisible, setIsModalVisible] = useState(false);
  // console.log("This is the next msg", props.nextMessage)

  const handleImagePress = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <View>
      {/* removed background color for image text message styling */}

      {/* date */}
      {(!props.prevMessage || (prevMessageDate === "" || getDate(messageDate) !== getDate(prevMessageDate))) &&
        (<MediumText style={timeStyle.day} color="#666666" size={14}>
          {getDate(messageDate, false) == getDate(new Date(), false) ? "Today" : getDate(messageDate, false)}
        </MediumText>)}

      
      <View style={props.url ? (props.sentBy == user.uid ? styles.youImage : styles.otherImage) : (props.sentBy == user.uid ? styles.you : styles.other)} borderRadius={20}>
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
        <Modal visible={isModalVisible} transparent={false}>
        {/* added top nav to image chat view */}

        <TopNav
        middleContent={
          <TouchableOpacity onPress={() => navigation.navigate("ChatRoomDetails", {
              group: group
          })}>
              <MediumText>{props.group.name}</MediumText>
          </TouchableOpacity>
        }
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => {
          // Temporary fix with invalid chat preview, to be fixed in the future for better speed.
          navigation.goBack();
        }}
        />
       
          <TouchableOpacity style={styles.modalContainer} onPress={handleCloseModal}>
            <Image
              source={{ uri: props.url }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      </View>


      {(!props.nextMessage || props.nextMessage.sentBy !== props.sentBy
        || (nextMessageDate === "" || getTime(messageDate) !== getTime(nextMessageDate))) &&
        (<NormalText style={props.sentBy == user.uid ? timeStyle.you : timeStyle.other} color="#666666" size={12}>
          {getTime(messageDate)}
          {/* {getDate(messageDate, false)}, {getTime(messageDate)} */}
        </NormalText>)}
      {/* {<NormalText style={props.sentBy == user.uid ? timeStyle.you : timeStyle.other} color="#666666" size={12}>{getDate(messageDate, false)}, {getTime(messageDate)}</NormalText>} */}
    </View>
  );
};

const styles = StyleSheet.create({
  you: {
    backgroundColor: "#5db075",
    borderRadius: 20,
    borderTopRightRadius: 0, // made top corner not round
    marginHorizontal: 30,
    marginVertical: 3,
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
    marginVertical: 3,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: "flex-start",
    maxWidth: 200,
  },
  youImage: {
    alignSelf: "flex-end",
    maxWidth: 200,
    marginHorizontal: 30,
    marginVertical: 3,
  }, otherImage: {
    marginHorizontal: 30,
    marginVertical: 3,
    alignSelf: "flex-start",
    maxWidth: 200,
  }, image: {
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
    aspectRatio: 1
  },
});

const timeStyle = StyleSheet.create({
  you: {
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 0,
    alignSelf: "flex-end",
    maxWidth: 200,
  },
  other: {
    marginHorizontal: 10,
    marginTop: 5,
    marginBottom: 5,
    paddingHorizontal: 20,
    paddingVertical: 0,
    alignSelf: "flex-start",
    maxWidth: 200,
  },
  day: {
    alignSelf: "center", 
  }
});

export default TextMessage;

