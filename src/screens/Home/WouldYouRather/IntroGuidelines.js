// Introductory Guidelines for playing Would You Rather Game

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import Button from "../../../components/Button";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const IntroGuidelines = ({ route, navigation }) => {
  const { event } = route.params;
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);

  // Load questions when the component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      const currGame = db.collection('WyrGames').doc(event.id);

      // Check if game data already exists
      const doc = await currGame.get();
      if (!doc.exists) {
        // Fetch all questions from 'WyrQuestions' collection
        const questionsSnapshot = await db.collection('WyrQuestions').get();
        let questions = [];
        questionsSnapshot.forEach((doc) => {
          questions.push({ id: doc.id, ...doc.data() });
        });

        // Shuffle and select the first 20 questions
        shuffleArray(questions);
        const selectedQuestions = questions.slice(0, 20).map((q) => q.id);

        // Initialize the game data in Firestore
        await currGame.set({
          aVotes: 0,
          bVotes: 0,
          currentQuestionIndex: 0,
          discussionStage: false,
          players: [user.uid],
          questions: selectedQuestions,
          totalQuestions: 20,
          responsesCount: 0,
          userResponses: {},
        });
      } else {
        // If game data exists, update the players list
        await currGame.update({
          players: firebase.firestore.FieldValue.arrayUnion(user.uid),
        });
      }

      setLoading(false);
    };

    loadQuestions();
  }, []);

  // Shuffle utility function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Navigate to the first question
  const startGame = () => {
    navigation.navigate("Question", { event: event });
  };

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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5DB075" />
            <Text>Loading questions...</Text>
          </View>
        ) : (
          <Button
            style={styles.startButton}
            onPress={startGame}
          >
            Start Game
          </Button>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IntroGuidelines;