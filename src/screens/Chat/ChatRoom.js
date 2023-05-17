import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert,
  Image,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import * as ImagePicker from 'expo-image-picker';
// import { Camera} from 'expo-camera';

import { Ionicons } from "@expo/vector-icons";

import { KeyboardAvoidingView } from "react-native";

import TextInput from "../../components/TextInput";
import TextMessage from "../../components/TextMessage";
import MediumText from "../../components/MediumText";
import Button from "../../components/Button";

import firebase from "firebase/compat";
import { db, auth, storage } from "../../provider/Firebase";
import moment from "moment";

export default function ({ route, navigation }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]); // Users in group chat
  const [message, setMessage] = useState(""); // Text input for message

  const [loading, setLoading] = useState(true); // Loading state for the page

  // Common constant references
  let group = route.params.group;
  let uri = "https://firebasestorage.googleapis.com/v0/b/eat-together-303ec.appspot.com/o/groups%2FThu%20May%2018%202023%2021%3A18%3A00%20GMT-0700%20(PDT)Garden%20Dinner%2FF347FF36-60AC-4B7A-9159-A3E52A611943.png?alt=media&token=70d5f2d6-7e39-4240-a62e-9d5c8cd74a7e";
  const user = auth.currentUser;
  const [userInfo, setUserInfo] = useState(null);
  const messageRef = db.collection("Groups").doc(group.groupID);

  // On update, push messages
  useEffect(() => {
    db.collection("Users").doc(user.uid).onSnapshot((doc) => {
      setUserInfo(doc.data());
    });

    messageRef.onSnapshot((doc) => {
      if (doc.data()) { // Checks if doc exists (used to prevent crash after blocking a user)
        setUsers(doc.data().uids); // Users in group

        let temp = [];
        doc.data().messages.forEach((message) => {
          // insert message at beginning of array
          temp.unshift(message);
        });

        setMessages(temp);
        setRead(temp);
        setLoading(false);
      }
    });
  }, []);

  const handleUploadImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.cancelled) {
        const source = { uri: result.uri };
  
        const response = await fetch(source.uri);
        const blob = await response.blob();
        const filename = source.uri.substring(source.uri.lastIndexOf('/') + 1);
  
        // Upload to this group's folder
        var ref = storage.ref().child('groups/' + group.groupID + "/" + filename).put(blob, {
          contentType: 'image/jpeg'
        });
  
        try {
          await ref;
          const downloadURL = await ref.snapshot.ref.getDownloadURL();
          onSend(downloadURL);
          Alert.alert("Image Sent!");
        } catch (e) {
          console.log(e);
          Alert.alert("Failed to upload image.");
        }
        onSend();
      }
    } catch (error) {
      console.log(error);
      // Alert.alert("Error picking image.");
    }
  };
  

  // Set all messages to read
  const setRead = (messages) => {
    let temp = [];

    messages.forEach(message => {
      if (message.unread) {
        let newMessage = message;
        let unread = newMessage.unread.filter(u => u.uid === user.uid);

        if (unread.length > 0) {
          unread[0].unread = false;
        }
        
        temp.unshift(newMessage);
      } else {
        temp.unshift(message);
      }
    });

    messageRef.update({
      messages: temp
    });
  }

  const onSend = (imageURL) => {
    // Add unread to all users in group except current user
    let unread = [];
    users.forEach((uid) => {
      if (uid != user.uid) {
        unread.push({
          uid: uid,
          unread: true,
        });
      }
    });

    // Add message to database
    messageRef
      .update({
        messages: firebase.firestore.FieldValue.arrayUnion({
          message: message,
          sentAt: moment().unix(),
          sentBy: user.uid,
          sentName: userInfo.firstName + " " + userInfo.lastName.substring(0, 1) + ".",
          unread: unread,
          url: imageURL,
        }),
      })
      .then(() => {
        setMessage("");
        setImageURL(null);
      });
    
    users.forEach((uid) => {
      if (uid != user.uid) {
        db.collection("Users").doc(uid).update({
          hasUnreadMessages: true
        });
      }
    });
  };



  return (
    <Layout style={{flex: 1}}>
      <TopNav
        middleContent={
          <TouchableOpacity onPress={() => navigation.navigate("ChatRoomDetails", {
              group: group
          })}>
              <MediumText>{group.name}</MediumText>
          </TouchableOpacity>
        }
        leftContent={<Ionicons name="chevron-back" size={20} />}
        leftAction={() => {
          // Temporary fix with invalid chat preview, to be fixed in the future for better speed.
          navigation.goBack();
        }}
      />
      {loading ? 
        <View style={styles.noMsgsView}>
          <ActivityIndicator size={100} color="#5DB075" />
          <MediumText center>Hang tight ...</MediumText>
        </View>
      :
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : ""}
        >
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <TextMessage {...item}/>
            )}
            inverted={true}
            keyExtractor={(item) => item.sentAt.toString()}
          />
          <View style={styles.container}>
            {/* <Ionicons name="camera-outline" onPress={handleUploadImage} size={30} /> */}
            <TextInput
              style={styles.textInput}
              placeholder="Send Message"
              value={message}
              onChangeText={setMessage}
              iconLeft="camera-outline"
              iconRight="send"
              iconRightColor="#D3D3D3"
              iconRightFontSize={20}
              iconRightDisabled={message.length === 0}
              iconLeftOnPress={handleUploadImage}
              iconRightOnPress={() => onSend(null)}
            />
          </View>
        </KeyboardAvoidingView>
      }
    </Layout>
  );
}

const styles = StyleSheet.create({
  noMsgsView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },

  page: {
    paddingTop: 30,
    alignItems: "center",
    paddingHorizontal: 10,
  },

  background: {
    position: "absolute",
    width: Dimensions.get("screen").width,
    height: 100,
    backgroundColor: "#5DB075",
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  textInput: {
    width: '300%',
  },
});