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
import { Touchable } from "react-native";
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    StackedBarChart
  } from "react-native-chart-kit";

const Discussion = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
    // Get the current user
    const user = auth.currentUser;
    const green = "#5DB075";
    // must get the answer options and vote counts from db
    const option_A = "option A: some really long option that takes up a lot of space";
    const option_B = "option B";
    const [votes_A, setA] = useState(0);
    const [votes_B, setB] = useState(0);
    const chartConfig = {
        color: (opacity = 1) => green
    };
    const screenWidth = Dimensions.get("window").width
      const data = [
        {
          votes: votes_A,
          color: green
        },
        {
          votes: votes_B,
          color: "#CBE6BC"
          
        }
      ];
      // Remove player from game when they choose to exit
  const removePlayer = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({players: firebase.firestore.FieldValue.arrayRemove(user.uid)})
      // delete this document if there are 0 players left
    } 
  };

  const exitGame = () => {
    navigation.navigate("WhileYouEat", {
      event: event})
  };

  // Fetch question and response data on page load
  useEffect(() => {
    loadData()
  }, []);

  const loadData = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      setA((votes_A) => doc.data().aVotes)
      setB((votes_B) => doc.data().bVotes)
    } 
  }

  const nextQuestion = () => {
    navigation.push("Question", {
      event: event})
  }

  const generateQuestion = async () => {
    const currGame = db.collection('WyrGames').doc(event.id);
    const doc = await currGame.get();
    if (doc.exists) {
      currGame.update({aVotes: 0, bVotes: 0})
    } 
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
            <View alignSelf={"center"}><MediumText paddingHorizontal={15}>{option_A}</MediumText></View>
            <MediumText style={[styles.option, styles.optionA]} color={"white"}>
                {votes_A}/{votes_A+votes_B}
            </MediumText>
            <View alignSelf={"center"}><MediumText paddingHorizontal={15}>{option_B}</MediumText></View>
            <MediumText style={[styles.option, styles.optionB]} color={green}>
                {votes_B}/{votes_A+votes_B}
            </MediumText>
            {/*Do some logic here that moves everyone onto next question page */}
            {user.uid == event.hostID ? 
            <View style={styles.nextButton}>
                <Button backgroundColor={"gray"} onPress={
                  () => {generateQuestion(); nextQuestion();}
                }>
                    Next Question
                </Button>
            </View>
            : null}
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
