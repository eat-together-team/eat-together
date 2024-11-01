import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const Question = ({ route, navigation }) => {
  const [event, setEvent] = useState(route.params.event);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [responsesCount, setResponsesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [colors, setColors] = useState([]);
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

  useEffect(() => {
    // Shuffle colors
    const shuffleColors = () => {
      let colorsArray = ["#7A9CAE", "#AE7A7A", "#9B715A", "#E9B94C", "#E72525", "#38A2FF", "#83C18B"];
      for (let i = colorsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorsArray[i], colorsArray[j]] = [colorsArray[j], colorsArray[i]];
      }
      setColors(colorsArray);
    };

    shuffleColors();
  }, []);

  return (
    <Layout>
      <TopNav
        middleContent={<MediumText left>Question</MediumText>}
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color="black" size={20} />
            <NormalText color="black">Exit</NormalText>
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

        <View style={styles.options}>
          {isLoading ? (
            <>
              <TouchableOpacity
                disabled={true}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors[0] },
                ]}
              >
                <MediumText style={styles.optionText}>Loading...</MediumText>
              </TouchableOpacity>
              <View style={styles.orContainer}>
                <MediumText style={styles.orText}>OR</MediumText>
              </View>
              <TouchableOpacity
                disabled={true}
                style={[
                  styles.optionButton,
                  { backgroundColor: colors[1] },
                ]}
              >
                <MediumText style={styles.optionText}>Loading...</MediumText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => addVote('A')}
                disabled={isDisabled}
                style={[
                  styles.optionButton,
                  selectedOption === 'A' && styles.selectedOption,
                  { backgroundColor: colors[0] },
                ]}
              >
                <MediumText style={styles.optionText}>{optionA}</MediumText>
              </TouchableOpacity>
              <View style={styles.orContainer}>
                <MediumText style={styles.orText}>OR</MediumText>
              </View>
              <TouchableOpacity
                onPress={() => addVote('B')}
                disabled={isDisabled}
                style={[
                  styles.optionButton,
                  selectedOption === 'B' && styles.selectedOption,
                  { backgroundColor: colors[1] },
                ]}
              >
                <MediumText style={styles.optionText}>{optionB}</MediumText>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.responsesLabelContainer}>
          <MediumText># of Responses</MediumText>
        </View>

        <View style={styles.responsesContainer}>
          {/* <Image source={require("../../../../assets/reponseswyr.png")} style={styles.responseImage} /> */}
          <View style={styles.responseTextContainer}>
            <MediumText>{responsesCount} / {event.attendees.length}</MediumText>
          </View>
        </View>

        {isHost && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity onPress={moveToDiscuss} style={[styles.nextButton, styles.optionButton]}>
              <Text style={styles.nextButtonText}>Next Question</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  options: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  optionButton: {
    marginVertical: 10,
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    elevation: 5,
  },
  optionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: "black",
  },
  orContainer: {
    marginVertical: 15,
    alignSelf: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  orText: {
    textAlign: "center",
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  responsesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 10,
  },
  responseImage: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  responseTextContainer: {
    alignItems: "center",
  },
  responsesLabelContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  nextButtonContainer: {
    marginVertical: 30,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: "#5DB075",
    borderRadius: 10,
    paddingVertical: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 10,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
});

export default Question;