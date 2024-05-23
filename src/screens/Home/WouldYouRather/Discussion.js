// The discussion screen displays vote results for WYR question

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import SmallText from "../../../components/SmallText";
import Button from "../../../components/Button";
import BorderedButton from "../../../components/BorderedButton";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    StackedBarChart
  } from "react-native-chart-kit";
import { random } from "lodash";

const Discussion = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
    // Get the current user
    const user = auth.currentUser;
    const green = "#5DB075";
    // get the answer options and vote counts
    const [optionA, setOptionA] = useState('option A');
    const [optionB, setOptionB] = useState('option B');
    const [votesA, setVotesA] = useState(0);
    const [votesB, setVotesB] = useState(0);

    const chartConfig = {
        color: (opacity = 1) => green
    };
    const screenWidth = Dimensions.get("window").width
      const data = [
        {
          votes: votesA,
          color: green
        },
        {
          votes: votesB,
          color: "#CBE6BC"
          
        }
      ];

  // Remove player from game when they choose to exit
  const removePlayer = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({players: firebase.firestore.FieldValue.arrayRemove(user.uid)})
      // Delete this document if there are 0 players left
      if (doc.data().players.length == 1) {
        currGame.delete();
      }
    } 
  };

  // Exit: moves player back to event page
  const exitGame = () => {
    navigation.navigate("WhileYouEat", {
      event: event})
  };

  const loadData = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      setVotesA((votesA) => doc.data().aVotes)
      setVotesB((votesB) => doc.data().bVotes)
      const currQuestion = doc.data().currentQuestion;
      console.log(currQuestion)
      const question = await db.collection('WyrQuestions').doc(currQuestion).get()
      console.log(question.data());
      setOptionA((optionA) => question.data().optionA);
      setOptionB((optionB) => question.data().optionB);
    } 
  }

  // No longer in discussion; set status to false
  const readyForQuestion = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({discussionStage: false});
    }
  }

  // move Player back to question screen 
  const moveToQuestion = () => {
    navigation.push("Question", {
      event: event})
  };

  useEffect(() => {
    // retrieve current answer options & votes
    loadData();
    const intervalId = setInterval(loadData, 500);
    return () => {clearInterval(intervalId)};
    }, []);

  // Randomly pick out a question from the collection 'WyrQuestions'
  // only occurs if user is host
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
              console.log('enters includes function');
              currGame.update({
                currentQuestion: doc.id,
                seenQuestions: firebase.firestore.FieldValue.arrayUnion(doc.id),
                aVotes: 0,
                bVotes: 0
              });
          });
        })
      });
  }
  
  return (
    <Layout>
      <TopNav
        middleContent = {
            <MediumText>Discuss!</MediumText>
        }
        leftContent={
            <View flexDirection={"row"} alignItems={"center"} width={100}>
                <Ionicons
                    name="chevron-back"
                    color={green}
                    size={20}
                />
                <NormalText color={green}>Exit</NormalText>
          </View>
        }
        leftAction={() => {removePlayer(); exitGame();}}
      />
      <ScrollView>
        <PieChart
        data={data}
        width={screenWidth}
        height={200}
        chartConfig={chartConfig}
        accessor={"votes"}
        backgroundColor={"transparent"}
        hasLegend={false}
        center={[85, 3]}
        />
        
        <View>
            <View alignSelf={"center"}><MediumText paddingHorizontal={15}>{optionA}</MediumText></View>
            <MediumText style={[styles.option, styles.optionA]} color={"white"}>
                {votesA}/{votesA+votesB}
            </MediumText>
            <View alignSelf={"center"}><MediumText paddingHorizontal={15}>{optionB}</MediumText></View>
            <MediumText style={[styles.option, styles.optionB]} color={green}>
                {votesB}/{votesA+votesB}
            </MediumText>
            {/*Do some logic here that moves everyone onto next question page */}
            {/* {user.uid == event.hostID ?  */}
            <View style={styles.nextButton}>
                <Button backgroundColor={"gray"} onPress={
                  () => {randomQuestion(); readyForQuestion(); moveToQuestion();}
                }>
                    Next Question
                </Button>
            </View>
            {/* : null} */}
        </View>
      </ScrollView>
    </Layout>
  );
};

// Styling of page elements
const styles = StyleSheet.create({
  option: {
    paddingVertical: 8,
    marginVertical: 20, 
    marginHorizontal: 20,
    bottom: 10,
    elevation: 5,
    width: "60%",
    alignSelf: "center",
    alignContent: "center",
    flexDirection: "row",
    textAlign: "center"
  },

  optionA: {
    backgroundColor: "#5DB075",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 10
  },

  optionB: {
    backgroundColor: "white",
    borderColor: "#5DB075",
    borderWidth: 2,
    borderRadius: 10
  },

  nextButton: {
    marginVertical: 30,
    alignSelf: "center"
  }
});

export default Discussion;
