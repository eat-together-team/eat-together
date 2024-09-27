// Introductory Guidelines for playing Would You Rather Game

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
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
      currGame.update({ players: firebase.firestore.FieldValue.arrayUnion(user.uid) });
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

  // Move onto Question stage screen
  const startGame = () => {
    navigation.navigate("Question", {
      event: event,
      optionA: optionA,
      optionB: optionB
    });
  };

  // Randomly pick out a question from the collection 'WyrQuestions'
  const randomQuestion = () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    let count = 0;
    db.collection('WyrQuestions')
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          count += 1;
        });
        db.collection('WyrQuestions')
          .where('random', '==', Math.floor(Math.random() * count))
          .get()
          .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
              currGame.update({
                currentQuestion: doc.id,
                seenQuestions: firebase.firestore.FieldValue.arrayUnion(doc.id)
              });
              setOptionA(doc.data().optionA);
              setOptionB(doc.data().optionB);
            });
          })
      });
  }

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>Guidelines</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={"black"}
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoContainer}>
            <MediumText size={20} style={styles.heading}>
              Would You Rather
            </MediumText>

            <View style={styles.ruleContainer}>
              <Image
                source={require('../../../../assets/guideline1.png')}
                style={styles.ruleImage}
                resizeMode="contain"
              />
              <NormalText style={styles.ruleText} size={18}>
                Each player will have time to answer as long as the host wishes
              </NormalText>
            </View>
            <View style={styles.ruleContainer}>
              <Image
                source={require('../../../../assets/guideline2.png')}
                style={styles.ruleImage}
                resizeMode="contain"
              />
              <NormalText style={styles.ruleText} size={18}>
                This shows how many people have answered the question
              </NormalText>
            </View>

            <MediumText size={20} style={styles.heading}>
              Discussion
            </MediumText>

            <View style={styles.ruleContainer}>
              <Image
                source={require('../../../../assets/guideline3.png')}
                style={styles.ruleImage3}
                resizeMode="contain"
              />
              <NormalText style={styles.ruleText} size={18}>
                Share why you chose your answer with the group
              </NormalText>
            </View>
            <View style={styles.ruleContainer}>
              <Image
                source={require('../../../../assets/guideline4.png')}
                style={styles.ruleImage}
                resizeMode="contain"
              />
              <NormalText style={styles.ruleText} size={18}>
                Give everyone a chance to speak
              </NormalText>
            </View>
            <View style={styles.ruleContainer}>
              <Image
                source={require('../../../../assets/guideline5.png')}
                style={styles.ruleImage}
                resizeMode="contain"
              />
              <NormalText style={styles.ruleText} size={18}>
                Tap "Next Question" when you're done discussing
              </NormalText>
            </View>
          </View>
        </ScrollView>

        <Button marginHorizontal ={20} style={styles.startButton} onPress={() => { addGameData(); startGame(); }}>
          Start Game
        </Button>
      </View>
    </Layout>
  );
};

// Styling of page elements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingVertical: 5,
  },
  infoContainer: {
    marginHorizontal: 30,
  },
  heading: {
    textAlign: 'center',
    marginVertical: 10,
  },
  ruleContainer: {
    marginVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  ruleImage: {
    width: 100, 
    height: 100, 
    marginRight: 20,
    borderRadius: 41,
  },
  ruleImage3:{
    width: 100, 
    height: 100, 
    marginRight:20,
    borderRadius: 30,
  },
  ruleText: {
    flex: 1,
    fontSize: 18,
  },
  startButton: {
    marginHorizontal: 30,
    marginBottom: 20,
  },
});

export default IntroGuidelines;