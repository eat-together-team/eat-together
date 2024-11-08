import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import { db, auth } from "../../../provider/Firebase";

const Discussion = ({ route, navigation }) => {
  const { event } = route.params;
  const currGame = db.collection('WyrGames').doc(event.id);
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [aVotes, setAVotes] = useState(0);
  const [bVotes, setBVotes] = useState(0);
  const [responsesCount, setResponsesCount] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchVotes = async () => {
      const doc = await currGame.get();
      if (doc.exists) {
        const gameData = doc.data();
        setAVotes(gameData.aVotes);
        setBVotes(gameData.bVotes);
        setResponsesCount(Object.keys(gameData.userResponses || {}).length);
        setCurrentQuestionIndex(gameData.currentQuestionIndex + 1);
        setOptionA(gameData.currentOptionA);
        setOptionB(gameData.currentOptionB);
      }
    };

    fetchVotes();
  }, [event.id]);

  useEffect(() => {
    setIsHost(user.uid === event.hostID);
  }, [event.hostID]);

  const moveToNextQuestion = async () => {
    const doc = await currGame.get();
    if (doc.exists) {
      let currentQuestionIndex = doc.data().currentQuestionIndex;
      currentQuestionIndex += 1;

      if (currentQuestionIndex < doc.data().questions.length) {
        // Update to next question and reset votes and responses
        await currGame.update({
          currentQuestionIndex,
          aVotes: 0,
          bVotes: 0,
          responsesCount: 0,
          discussionStage: false,
          userResponses: {}, // Reset user responses
        });

        navigation.navigate("Question", {
          event: event,
        });
      } else {
        // Navigate to EndGame if all questions have been answered
        navigation.navigate("EndGame");
      }
    }
  };

  const getBarWidth = (votes, totalVotes) => {
    if (totalVotes === 0) return "0%";
    return `${(votes / totalVotes) * 100}%`;
  };

  return (
    <Layout>
      <TopNav
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color="black" size={20} />
            <NormalText color="black">Back</NormalText>
          </View>
        }
        leftAction={() => navigation.goBack()}
        rightContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 110 }}>
            <Text style={styles.questionWord}>Question: </Text>
            <Text style={styles.questionNumber}>{currentQuestionIndex}</Text>
            <Text style={styles.questionText}>/20</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoContainer}>
          <LargeText>Discuss Your Answers!</LargeText>
          <MediumText style={styles.subHeaderText}>Let's see what everyone chose!</MediumText>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.option}>
            <MediumText style={styles.optionText}>{optionA}</MediumText>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: getBarWidth(aVotes, responsesCount) }]} />
            </View>
            <NormalText style={styles.voteCount}>{aVotes} votes</NormalText>
          </View>

          <View style={styles.option}>
            <MediumText style={styles.optionText}>{optionB}</MediumText>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: getBarWidth(bVotes, responsesCount) }]} />
            </View>
            <NormalText style={styles.voteCount}>{bVotes} votes</NormalText>
          </View>
        </View>

        {isHost && (
          <View style={styles.nextButtonContainer}>
            <TouchableOpacity onPress={moveToNextQuestion} style={[styles.nextButton, styles.optionButton]}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  infoContainer: {
    alignItems: "center",
    marginVertical: 20,
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
  option: {
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
    marginBottom: 5,
  },
  barContainer: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    backgroundColor: "#5DB075",
  },
  voteCount: {
    textAlign: "left",
    marginTop: 5,
    fontSize: 16,
    color: "gray",
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
});

export default Discussion;