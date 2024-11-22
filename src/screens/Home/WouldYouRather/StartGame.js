import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import PlayerList from "../../../components/PlayerList";
import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import Button from "../../../components/Button";
import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const StartGame = ({ route, navigation }) => {
  const { event } = route.params;

  // Event details
  const [friend, setFriend] = useState(null); // Display a friend who is also attending the event
  const [host, setHost] = useState(null); // Get the host of the event

  // Data for the attendees
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get the current user
  const user = auth.currentUser;

  // Fetch meetup data on page load
  useEffect(() => {
    getAttendees(); // Fetch attendees

    // Fetch host info (not for recommendations)
    if (event.hostID) {
      db.collection("Users")
        .doc(event.hostID)
        .get()
        .then((doc) => {
          setHost(doc.data());
        });
    }
  }, []);

  // Fetch all attendees of this event
  const getAttendees = async () => {
    try {
      const attendeePromises = event.attendees.map((attendee) =>
        db.collection("Users").doc(attendee).get()
      );
      const attendeeDocs = await Promise.all(attendeePromises);
      const attendeesData = attendeeDocs.map((doc) => doc.data());
      setPeople(attendeesData);
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  const addGameData = async () => {
    const user = auth.currentUser;
    const currGame = db.collection('WyrGames').doc();

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
      id: currGame.id, 
    });

    navigation.navigate("IntroGuidelines", {
      event: { id: currGame.id },
    });
  };

  // Shuffle utility function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const startGuidelines = () => {
    navigation.navigate("IntroGuidelines", { event: event });
  };

  const startGame = async () => {
    setLoading(true);
    try {
      const currGame = db.collection('WyrGames').doc();

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
        totalQuestions: 20, // Ensure this is set to 20
        responsesCount: 0,
        id: currGame.id,
      });

      navigation.navigate("IntroGuidelines", {
        event: { id: currGame.id },
      });
    } catch (error) {
      console.error("Error starting game:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.layout}>
      <TopNav
        middleContent={<MediumText center>Would You Rather?</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={loading ? "grey" : "black"}
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ImageBackground
            source={require("../../../../assets/wyr.png")} 
            style={styles.imageBackground}
            resizeMode="cover"
          />

          <View style={styles.infoContainer}>
            <LargeText size={30} marginBottom={10}>
              Would You Rather?
            </LargeText>

            <View style={styles.row}>
              <MediumText>Players:</MediumText>
            </View>
            <View style={styles.row}>
              {people.length === 0 ? (
                <NormalText paddingHorizontal={25} size={17} color="black">
                  {"No players have joined yet"}
                </NormalText>
              ) : (
                people.map((person, index) => (
                  <PlayerList
                    person={person}
                    key={person.id}
                    color="white"
                    width="50%"
                    height="10%"
                    click={() => {
                      navigation.navigate("FullProfile", {
                        person: person,
                      });
                    }}
                  />
                ))
              )}
            </View>

            <View style={styles.infoSection}>
              <MediumText>Event:</MediumText>
              <NormalText>{event.title}</NormalText>
              <MediumText size={17}>{event.name}</MediumText>
              {/* <NormalText>Location: {event.location}</NormalText> */}
            </View>
          </View>
        </ScrollView>

        <Button
          marginVertical={35}
          marginHorizontal={20}
          style={styles.startButton}
          onPress={startGuidelines}
        >
          Guidelines
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
   layout: {
    backgroundColor: "#FFF",
  },
  container: {
    flex: 3,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  infoContainer: {
    marginHorizontal: 30,
    // margin not there
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    flexWrap: "wrap",
  },
  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: "#5DB075",
    borderWidth: 1,
    backgroundColor: "white",
    marginRight: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  imageBackground: {
    width: Dimensions.get("screen").width,
    height: 200,
    marginBottom: 20,
  },
  logistics: {
    marginVertical: 15,
  },
  unread: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "red",
    position: "absolute",
  },
  infoSection: {
    marginVertical: 20,
  },
  startButton: {
    // Add styles for the start button if needed
  },
});

export default StartGame;