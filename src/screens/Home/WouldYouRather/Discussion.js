import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const Discussion = ({ route, navigation }) => {
  const { event, optionA, optionB } = route.params;
  const [responsesCount, setResponsesCount] = useState(0);
  const [aVotes, setAVotes] = useState(0);
  const [bVotes, setBVotes] = useState(0);
  const [isHost, setIsHost] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchVotes = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);
      const doc = await currGame.get();
      if (doc.exists) {
        setAVotes(doc.data().aVotes);
        setBVotes(doc.data().bVotes);
        setResponsesCount(doc.data().aVotes + doc.data().bVotes);
        setCurrentQuestionIndex(doc.data().questions.indexOf(doc.data().currentQuestion) + 1);
        setTotalQuestions(doc.data().questions.length);
      }
    };

    fetchVotes();
  }, [event.id]);

  useEffect(() => {
    const user = auth.currentUser;
    setIsHost(user.uid === event.hostID);
  }, [event.hostID]);

  const moveToNextQuestion = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      const questions = doc.data().questions;
      const currentQuestionIndex = questions.indexOf(doc.data().currentQuestion);
      const nextQuestionIndex = (currentQuestionIndex + 1) % questions.length;
      const nextQuestionId = questions[nextQuestionIndex];

      await currGame.update({ currentQuestion: nextQuestionId });

      navigation.navigate("Question", {
        event: { ...event, currentQuestion: nextQuestionId },
      });
    }
  };

  const getBarWidth = (votes, totalVotes) => {
    if (totalVotes === 0) return "0%";
    return `${(votes / totalVotes) * 100}%`;
  };
  const moveToEndGame = () => {
    navigation.navigate("EndGame");
  };

  return (
    <Layout>
      <TopNav
      
        leftContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100 }}>
            <Ionicons name="chevron-back" color="black" size={20} />
            <NormalText color="black">Exit Game</NormalText>
          </View>
        }
        // need to update this later by adding coutner for hte current queston index
        rightContent={
          <View style={{ flexDirection: "row", alignItems: "center", width: 100}}>
            <Text>Question: </Text>
            <Text style={styles.questionNumber}>{currentQuestionIndex}</Text>
            <Text style={styles.questionText}>/20</Text>
          </View>
        }
        leftAction={() => navigation.goBack()}
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
              <Text style={styles.nextButtonText}>Next Question</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* temporary button to end the game without having to go thorugh 20 questions */}
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("EndGame")}>
            <Text>End Game</Text>
          </TouchableOpacity>
        </View>
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
  headerText: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 20,
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
    fontSize: 14,
    color: "#5DB075",
    marginRight: 2,
  },
  questionText: {
    fontSize: 14,
    color: "black",
    marginRight: 10,
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

export default Discussion;