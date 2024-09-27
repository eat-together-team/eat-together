// The discussion screen displays vote results for WYR question

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import Button from "../../../components/Button";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const Discussion = ({ route, navigation }) => {
  const [event, setEvent] = useState(route.params.event);
  // Get the current user
  const user = auth.currentUser;
  const green = "#5DB075";
  // Get the answer options and vote counts
  const [optionA, setOptionA] = useState(route.params.optionA);
  const [optionB, setOptionB] = useState(route.params.optionB);
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1); // Initialize question number

  // Remove player from game when they choose to exit
  const removePlayer = async () => {
    const currGame = db.collection("WyrGames").doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({
        players: firebase.firestore.FieldValue.arrayRemove(user.uid),
      });
      // Delete this document if there are 0 players left
      if (doc.data().players.length === 1) {
        currGame.delete();
      }
    }
  };

  // Exit: moves player back to event page
  const exitGame = () => {
    navigation.navigate("WhileYouEat", {
      event: event,
    });
  };

  const loadData = async () => {
    const currGame = db.collection("WyrGames").doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      setVotesA(doc.data().aVotes);
      setVotesB(doc.data().bVotes);
      const currQuestion = doc.data().currentQuestion;
      const questionDoc = await db
        .collection("WyrQuestions")
        .doc(currQuestion)
        .get();
      setOptionA(questionDoc.data().optionA);
      setOptionB(questionDoc.data().optionB);
      // Update question number based on seenQuestions length
      setQuestionNumber(doc.data().seenQuestions.length);
    }
  };

  // No longer in discussion; set status to false
  const readyForQuestion = async () => {
    const currGame = db.collection("WyrGames").doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({ discussionStage: false });
    }
  };

  // Move Player back to question screen
  const moveToQuestion = () => {
    navigation.push("Question", {
      event: event,
      optionA: optionA,
      optionB: optionB,
    });
  };

  useEffect(() => {
    // Retrieve current answer options & votes
    loadData();
    const intervalId = setInterval(loadData, 500);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Randomly pick out a question from the collection 'WyrQuestions'
  // Only occurs if user is host
  const randomQuestion = () => {
    const currGame = db.collection("WyrGames").doc(event.id);
    let count = 0;
    db.collection("WyrQuestions").onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        count += 1;
      });
      db.collection("WyrQuestions")
        .where("random", "==", Math.floor(Math.random() * count))
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            currGame.update({
              currentQuestion: doc.id,
              seenQuestions: firebase.firestore.FieldValue.arrayUnion(doc.id),
              aVotes: 0,
              bVotes: 0,
            });
          });
        });
    });
  };

  // Calculate total votes
  const totalVotes = votesA + votesB;


  return (
    <Layout>
      <TopNav
        middleContent={
          <MediumText>Question {questionNumber} / 20</MediumText>
        }
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color={green} size={20} />
            <NormalText color={green}>Exit</NormalText>
          </View>
        }
        leftAction={() => {
          removePlayer();
          exitGame();
        }}
      />
      <ScrollView>
        <View style={styles.headerContainer}>
          <LargeText size={25}style={styles.headerText}>Discuss Your Answers!</LargeText>
          <NormalText style={styles.subHeaderText}>
            Why did you pick your answer?
          </NormalText>
        </View>

        <View style={styles.optionsContainer}>
          <MediumText style={styles.optionText}>{optionA}</MediumText>
          <NormalText style={styles.voteCount}>
            {votesA} / {totalVotes}
          </NormalText>
        </View>

        <View style={styles.optionsContainer}>
          <MediumText style={styles.optionText}>{optionB}</MediumText>
          <NormalText style={styles.voteCount}>
            {votesB} / {totalVotes}
          </NormalText>
        </View>

        <View style={styles.nextButton}>
          <Button
            onPress={() => {
              randomQuestion();
              readyForQuestion();
              moveToQuestion();
            }}
          >
            Next Question
          </Button>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  headerText: {
    textAlign: "center",
  },
  subHeaderText: {
    textAlign: "center",
    fontSize: 14,
    color: "gray",
    marginTop: 5,
  },
  optionsContainer: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 18,
    marginBottom: 5,
  },
  voteCount: {
    textAlign: "left",
    marginTop: 5,
    fontSize: 16,
    color: "gray",
  },
  nextButton: {
    marginVertical: 30,
    alignSelf: "center",
  },
});

export default Discussion;