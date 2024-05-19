// Question screen displays question and answer options for user selection

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import SmallText from "../../../components/SmallText";
import Button from "../../../components/Button";
import BorderedButton from "../../../components/BorderedButton";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";
import { Touchable } from "react-native";

const Question = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
    const [isDisabled, setDisabled] = useState(false);
    const green = "#5DB075";
    // must get question option to display
    const option_A = "option A: some really long option that takes up a lot of space";
    const option_B = "option B";

    const [host, setHost] = useState(null); // Get the host of the event
    const user = auth.currentUser; // Get the current user
    const isHost = (host==user);

    // Adds a user's vote for option A
    const addVoteA = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);
      const doc = await currGame.get();
      if (doc.exists) {
        votes = doc.data().aVotes
        currGame.update({aVotes: votes+1})
        setDisabled((isDisabled) => true)
      } 
    }

    // Adds a user's vote for option B
    const addVoteB = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);
      const doc = await currGame.get();
      if (doc.exists) {
        votes = doc.data().bVotes
        currGame.update({bVotes: votes+1})
        setDisabled((isDisabled) => true)
      } 
    }

    // Remove player from game when they choose to exit
  const removePlayer = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({players: firebase.firestore.FieldValue.arrayRemove(user.uid)})
      // Delete this document if there are 0 players left
    } 
  };

  const exitGame = () => {
    navigation.navigate("WhileYouEat", {
      event: event})
  };

  // reset button to be enabled on page load
  useEffect(() => {
    setDisabled((isDisabled) => false)
  }, []);

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText left>Question</MediumText>}
        leftContent={
            <View flexDirection={"row"} alignItems={"center"} width={100}>
                <Ionicons
                    name="chevron-back"
                    color={green}
                    size={20}
                />
                <NormalText color={green}>Exit</NormalText>
          </View>
        }
        // Remove player from game when they choose to exit
        leftAction={() => {removePlayer(); exitGame();}}
      />
      <ScrollView>
        <View style={styles.infoContainer}>
          <LargeText>
            Would You Rather...
          </LargeText>
        </View>
        
        {/*Should disable buttons after choosing one*/}
        <View style={styles.options}>
            <Button onPress={addVoteA} disabled={isDisabled}>
                {option_A}
            </Button>

            <View marginVertical={15} alignSelf={"center"}><MediumText>OR</MediumText></View>

            <BorderedButton onPress={addVoteB} disabled={isDisabled}>
                {option_B}
            </BorderedButton>
        
            {/*Do some logic here that moves everyone onto discussion page */}
            {user.uid == event.hostID ? 
            <View style={styles.nextButton}>
                <Button backgroundColor={"grey"} onPress={() => {
                    navigation.navigate("Discussion", {event: event})
                }}>
                    Next
                </Button>
            </View>
            : null}

        </View>
      </ScrollView>
    </Layout>
  );
};

// Styling of page elements
const styles = StyleSheet.create({
  infoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20
  },

  options: {
    marginVertical: 10,
    padding: 20
  },

  nextButton: {
    top: 20,
    marginVertical: 20,
    width: 130,
    height: 60,
    flexDirection: "column",
    alignSelf: "flex-end",
  }
});

export default Question;
