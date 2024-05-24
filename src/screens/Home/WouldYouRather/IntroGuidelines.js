// Introductory Guidelines for playing Would You Rather Game

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import Button from "../../../components/Button";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const IntroGuidelines = ({ route, navigation }) => {
  const [event, setEvent] = useState(route.params.event);
  const [optionA, setOptionA] = useState('option A');
  const [optionB, setOptionB] = useState('option B');
  const user = auth.currentUser;

  // Fetch data from Firestore to see if game is created or not
  // If yes, just add user to the game
  // If no, add a new doc to WyrGames collection for this event (ID = eventID)
  const addGameData = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({players: firebase.firestore.FieldValue.arrayUnion(user.uid)});
    } else {
      currGame.set({
        aVotes: 0,
        bVotes: 0,
        currentQuestion: "",
        discussionStage: false, 
        players: [user.uid],
        seenQuestions: []
      });
      randomQuestion();
    }    
  };

  // move onto Question stage screen
  const startGame = () => {
    navigation.navigate("Question", {
      event: event,
      optionA: optionA,
      optionB: optionB});
  };

  // Randomly pick out a question from the collection 'WyrQuestions'
  const randomQuestion = () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    count = 0;
    db.collection('WyrQuestions')
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          count += 1;
      });
      db.collection('WyrQuestions')
        .where('random', '==', Math.floor(Math.random()*count))
        .get()
        .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            currGame.update({
              currentQuestion: doc.id,
              seenQuestions: firebase.firestore.FieldValue.arrayUnion(doc.id)
            });
            setOptionA((optionA) => doc.data().optionA);
            setOptionB((optionB) => doc.data().optionB);
          });
        })
      });
  }

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>Would You Rather?</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={"black"}
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      <ScrollView>

        <View style={styles.infoContainer}>
          <MediumText>
            Would You Rather Guidelines
          </MediumText>

        <View style={styles.container}>
          <Ionicons name="checkmark-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>
            Each player will select an answer on their screen
          </NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="checkmark-done-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>
            Once everyone has submitted, press next to continue onto discussion
          </NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="pie-chart-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>
            Results will display how many people answered what option
          </NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="chatbubbles-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>
            Share why you chose your answer with the group
          </NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="arrow-forward-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>
            Tap "Next Question" when done discussing to move on
          </NormalText>
        </View>

          <Button onPress={() => {addGameData(); startGame();}}>
            Start
          </Button>

        </View>
      </ScrollView>
    </Layout>
  );
};

// Styling of page elements
const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 30,
    marginVertical: 5,
    marginBottom: 100,
  },

  container: {
    marginVertical: 10,
    marginRight: 5,
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 5,
    alignItems: "center"
  },

  ruleImage: {
    marginRight: 20,
    color: "#5DB075"
  },

  ruleText: {
    marginRight: 35
  }
});

export default IntroGuidelines;
