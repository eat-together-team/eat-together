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
  const { event } = route.params;
  const currGame = db.collection('WyrGames').doc(event.id);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [responsesCount, setResponsesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const user = auth.currentUser;
  const isHost = user.uid === event.hostID;

  // Function to shuffle colors
  const shuffleColors = () => {
    const colorsArray = ["#7A9CAE", "#AE7A7A", "#9B715A", "#E9B94C", "#E72525", "#38A2FF", "#83C18B"];
    // Shuffle the colorsArray
    for (let i = colorsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorsArray[i], colorsArray[j]] = [colorsArray[j], colorsArray[i]];
    }
    // Use only two colors for the two options
    setColors(colorsArray.slice(0, 2));
  };

  // Function to retrieve options and update states
  const retrieveOptions = async () => {
    const doc = await currGame.get();
    if (doc.exists) {
      const gameData = doc.data();
      const { questions, currentQuestionIndex } = gameData;

      // Update current question index
      setCurrentQuestionIndex(currentQuestionIndex);

      // Check if there are remaining questions
      if (currentQuestionIndex < questions.length) {
        const currQuestionId = questions[currentQuestionIndex];
        const questionDoc = await db.collection('WyrQuestions').doc(currQuestionId).get();
        if (questionDoc.exists) {
          setOptionA(questionDoc.data().optionA);
          setOptionB(questionDoc.data().optionB);
          setIsLoading(false);

          // Shuffle colors after loading the new question
          shuffleColors();

          // Reset selected option for the new question
          setSelectedOption(null);

          // Reset responses count for the new question
          setResponsesCount(0);
        }
      } else {
        // Navigate to EndGame if no more questions
        navigation.navigate("EndGame");
      }

      // Update responses count
      setResponsesCount(Object.keys(gameData.userResponses || {}).length);
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

  // Function to handle voting
  const addVote = async (option) => {
    const doc = await currGame.get();
    if (doc.exists) {
      const gameData = doc.data();
      const userId = user.uid;
      const previousOption = gameData.userResponses?.[userId];

      let aVotes = gameData.aVotes || 0;
      let bVotes = gameData.bVotes || 0;

      // Adjust vote counts if the user had previously selected an option
      if (previousOption) {
        if (previousOption === 'A') {
          aVotes -= 1;
        } else if (previousOption === 'B') {
          bVotes -= 1;
        }
      } else {
        // Increment responsesCount if it's the user's first response to this question
        await currGame.update({
          responsesCount: firebase.firestore.FieldValue.increment(1),
        });
        setResponsesCount(responsesCount + 1);
      }

      // Increment the vote count for the newly selected option
      if (option === 'A') {
        aVotes += 1;
      } else if (option === 'B') {
        bVotes += 1;
      }

      // Update the user's response in the database
      await currGame.update({
        aVotes,
        bVotes,
        [`userResponses.${userId}`]: option,
      });

      setSelectedOption(option);
    }
  };

  // Remove player from game when they choose to exit
  const removePlayer = async () => {
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
    await currGame.update({ discussionStage: true });
    navigation.navigate("Discussion", {
      event: event,
    });
  };

  return (
    <Layout>
      <TopNav
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color="black" size={20} />
            <NormalText color="black">Exit</NormalText>
          </View>
        }
        leftAction={() => {
          removePlayer();
          exitGame();
        }}
        rightContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 110 }}>
            <Text style={styles.questionWord}>Question: </Text>
            <Text style={styles.questionNumber}>{currentQuestionIndex + 1}</Text>
            <Text style={styles.questionText}>/20</Text>
          </View>
        }
      />
      <ScrollView>
        <View style={styles.infoContainer}>
          <LargeText>Would You Rather...</LargeText>
        </View>

        <View style={styles.options}>
          {isLoading ? (
            <>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: "#ccc" }]}
                disabled={true}
              >
                <MediumText style={styles.optionText}>Loading...</MediumText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: "#ccc" }]}
                disabled={true}
              >
                <MediumText style={styles.optionText}>Loading...</MediumText>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => addVote('A')}
                style={[
                  styles.optionButton,
                  selectedOption === 'A' && styles.selectedOption,
                  { backgroundColor: colors[0] || '#5DB075' },
                ]}
              >
                <MediumText style={styles.optionText}>{optionA}</MediumText>
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <Text style={styles.orText}>OR</Text>
              </View>

              <TouchableOpacity
                onPress={() => addVote('B')}
                style={[
                  styles.optionButton,
                  selectedOption === 'B' && styles.selectedOption,
                  { backgroundColor: colors[1] || '#5DB075' },
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
          <Image source={require("../../../../assets/responseswyr.png")} style={styles.responseImage} />
          <MediumText style={styles.responsesText}>
            {responsesCount} / {event.attendees.length}
          </MediumText>
        </View>

        {isHost && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity onPress={moveToDiscuss} style={[styles.nextButton, styles.optionButton]}>
              <Text style={styles.nextButtonText}>Next</Text>
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
    fontSize: 18,
    color: "black",
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  responsesLabelContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  responsesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  responseImage: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  responsesText: {
    fontSize: 18,
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
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  questionNumber: {
    fontSize: 18,
    color: "#5DB075",
    marginRight: 2,
  },
  questionText: {
    fontSize: 18,
    color: "black",
  },
  questionWord: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Question;