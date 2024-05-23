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
import Button from "../../../components/Button";
import BorderedButton from "../../../components/BorderedButton";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const Question = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
    const [isDisabled, setDisabled] = useState(false);
    const green = "#5DB075";

    // get question options to display
    const [optionA, setOptionA] = useState('option A');
    const [optionB, setOptionB] = useState('option B');

    // Get the current user
    const user = auth.currentUser;

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
        if (doc.data().players.length == 1) {
          currGame.delete();
        }
      } 
    };

    // move Player back to event screen 
    const exitGame = () => {
      navigation.navigate("WhileYouEat", {
        event: event})
    };

    // move Player on to discussion screen 
    const moveToDiscuss = () => {
      navigation.push("Discussion", {
        event: event})
    };
    
    // updates discussionStage value to true; i.e. ready to discuss
    const readyToDiscuss = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);
      const doc = await currGame.get();
      if (doc.exists) {
        currGame.update({discussionStage: true});
      }
    }

    // gets answer options to display
    const retrieveOptions = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);
      const doc = await currGame.get();
        if (doc.exists) {
          const currQuestion = doc.data().currentQuestion;
          const question = await db.collection('WyrQuestions').doc(currQuestion).get()
          setOptionA((optionA) => question.data().optionA);
          setOptionB((optionB) => question.data().optionB);
        }
    }

    useEffect(() => {
      // retrieve current answer options
      retrieveOptions();
      const intervalId = setInterval(retrieveOptions, 500);
      return () => {clearInterval(intervalId)};
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
        
        {/* Disable buttons after choosing one to only allow 1 vote*/}
        <View style={styles.options}>
            <Button onPress={addVoteA} disabled={isDisabled}>
                {optionA}
            </Button>

            <View marginVertical={15} alignSelf={"center"}><MediumText>OR</MediumText></View>

            <BorderedButton onPress={addVoteB} disabled={isDisabled}>
                {optionB}
            </BorderedButton>
        
            {/*Moves onto discussion page*/}
            <View style={styles.nextButton}>
                <Button backgroundColor={"grey"} onPress={() => {
                    readyToDiscuss(); moveToDiscuss();
                }}>
                    Next
                </Button>
            </View>

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
