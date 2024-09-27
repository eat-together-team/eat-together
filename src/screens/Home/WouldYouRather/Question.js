// Question screen displays question and answer options for user selection

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [responsesCount, setResponsesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const green = "#5DB075";

  // Get question options to display
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');

  // Get the current user
  const user = auth.currentUser;
  const isHost = user.uid === event.hostID;

  // Function to handle voting
  const addVote = async (option) => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      if (option === 'A') {
        await currGame.update({ aVotes: firebase.firestore.FieldValue.increment(1) });
      } else if (option === 'B') {
        await currGame.update({ bVotes: firebase.firestore.FieldValue.increment(1) });
      }
      setIsDisabled(true);
      setSelectedOption(option);
    }
  };

  // Remove player from game when they choose to exit
  const removePlayer = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      await currGame.update({ players: firebase.firestore.FieldValue.arrayRemove(user.uid) });
      // Delete this document if there are 0 players left
      if (doc.data().players.length === 1) {
        await currGame.delete();
      }
    }
  };

  // Move Player back to event screen
  const exitGame = () => {
    navigation.navigate("WhileYouEat", {
      event: event,
    });
  };

  // Function to navigate to the discussion page
  const moveToDiscuss = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    await currGame.update({ discussionStage: true });

    navigation.navigate("Discussion", {
      event: event,
      optionA: optionA,
      optionB: optionB,
    });
  };

  // Updates answer options to display (if any changes)
  const retrieveOptions = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      const currQuestionId = doc.data().currentQuestion;
      if (currQuestionId) {
        const questionDoc = await db.collection('WyrQuestions').doc(currQuestionId).get();
        if (questionDoc.exists) {
          setOptionA(questionDoc.data().optionA);
          setOptionB(questionDoc.data().optionB);
          setIsLoading(false);
        }
      }

      // Update responses count
      const totalVotes = doc.data().aVotes + doc.data().bVotes;
      setResponsesCount(totalVotes);

      // If new question, reset local states
      if (isDisabled && selectedOption === null) {
        setIsDisabled(false);
      }
    }
  };

  useEffect(() => {
    // Retrieve current answer options and responses count
    retrieveOptions();
    const intervalId = setInterval(retrieveOptions, 800);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText left>Question</MediumText>}
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color={green} size={20} />
            <NormalText color={green}>Exit</NormalText>
          </View>
        }
        // Remove player from game when they choose to exit
        leftAction={() => {
          removePlayer();
          exitGame();
        }}
      />
      <ScrollView>
        <View style={styles.infoContainer}>
          <LargeText>Would You Rather...</LargeText>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <MediumText>Loading...</MediumText>
          </View>
        ) : (
          <View style={styles.options}>
            <Button
              onPress={() => addVote('A')}
              disabled={isDisabled}
              style={[
                styles.optionButton,
                selectedOption === 'A' && styles.selectedOption,
              ]}
            >
              {optionA}
            </Button>

            <View marginVertical={15} alignSelf={"center"}>
              <MediumText>OR</MediumText>
            </View>

            <BorderedButton
              onPress={() => addVote('B')}
              disabled={isDisabled}
              style={[
                styles.optionButton,
                selectedOption === 'B' && styles.selectedOption,
              ]}
            >
              {optionB}
            </BorderedButton>
          </View>
        )}

        {/* Display the number of responses */}
        <View style={styles.responsesContainer}>
          <MediumText>
            Number of responses: {responsesCount} / {event.attendees.length}
          </MediumText>
        </View>

        {/* Display "Next" button for the host */}
        {isHost && (
          <View style={styles.nextButtonContainer}>
            <Button onPress={moveToDiscuss}>
              Discuss
            </Button>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

// Styling of page elements
const styles = StyleSheet.create({
  infoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  options: {
    marginVertical: 10,
    padding: 20,
  },
  optionButton: {
    marginVertical: 10,
  },
  selectedOption: {
    backgroundColor: "gray",
  },
  responsesContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  nextButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});

export default Question;