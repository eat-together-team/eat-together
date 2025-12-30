import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";
import MediumText from "./MediumText";
import { storage } from "../provider/Firebase";
import SmallText from "./SmallText";
import moment from "moment";

const ChatPreview = (props) => {
  const [image, setImage] = useState(
    "https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png"
  );
  useEffect(() => {
    // TODO: Fix these pictures not showing up
    if (props.group.hasImage) {
      storage
        .ref("profilePictures/" + props.group.pictureID)
        .getDownloadURL()
        .then((uri) => {
          setImage(uri);
        });
    }
  }, []);

  let time = moment.unix(props.group.time).fromNow(true);

  return (
    <TouchableOpacity style={styles.outline} onPress={props.onPress}>
      <View style={styles.head}>
        {props.group.unread && <View style={styles.unread}/>}

        <View style={styles.time}>
          {props.group.time !== "" && <SmallText size={13}>{time}</SmallText>}
        </View>

        <View style={styles.headleft}>
          <Image style={styles.image} source={{ uri: image }} />
          <View style={styles.textContainer}>
            <View style={styles.nametimeframe}>
              <MediumText size={18}>{props.group.name}</MediumText>
            </View>
            <View>
              {props.group.message !== "" &&
                <SmallText size={15} weight={props.group.unread ? "bold" : "normal"} fontFamily={'Inter_900Black'} >"{props.group.message}"</SmallText>}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outline: {
    padding: 10,
    alignItems: "center",
  },

  head: {
    width: Dimensions.get('window').width,
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 30
  },

  headleft: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 200,
    justifyContent: "space-between"
  },

  textContainer: {
    flexDirection: "column"
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 90,
    borderColor: "white",
    borderWidth: 2,
    marginRight: 20,
  },

  name: {
    marginRight: 20
  },

  unread: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#5DB075",
    position: "absolute",
    top: 35,
    left: 5
  },

  time: {
    position: "absolute",
    top: 5,
    right: 25
  },

  nametimeframe: {
    marginBottom: 5
  }

});

export default ChatPreview;
