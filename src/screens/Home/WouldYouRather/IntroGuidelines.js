// Introductary Guidelines for playing Would You Rather Game

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image
} from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import LargeText from "../../../components/LargeText";
import MediumText from "../../../components/MediumText";
import NormalText from "../../../components/NormalText";
import Button from "../../../components/Button";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const IntroGuidelines = ({ route, navigation }) => {
  const [event, setEvent] = useState(route.params.event);
  return (
    <Layout>
      <TopNav
        middleContent={<MediumText center>Would You Rather?</MediumText>}
        leftContent={
          <Ionicons
            name="chevron-back"
            color={"black"}
            size={20}
          />
        }
        leftAction={() => navigation.goBack()}
      />
      <ScrollView>

        <View style={styles.infoContainer}>
          <MediumText>
            Would You Rather Guidelines
          </MediumText>

        <View style={styles.container}>
          <Ionicons name="checkmark-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>Each player will select an answer on their screen</NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="checkmark-done-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>Once everyone has submitted, host may press next to continue onto discussion</NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="bar-chart-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>Results will display how many people answered what option</NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="chatbubbles-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>Share why you chose your answer with the group</NormalText>
        </View>
        <View style={styles.container}>
          <Ionicons name="arrow-forward-circle-outline" size={30} style={styles.ruleImage}/>
          <NormalText style={styles.ruleText}>Tap "Next Question" when you're done discussing to move on</NormalText>
        </View>

          <Button onPress={() => {
            navigation.navigate("Question", {
              event: event})
          }}>
            Start
          </Button>

        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 30,
    marginVertical: 5,
    marginBottom: 100,
  },

  container: {
    marginVertical: 10,
    marginRight: 5,
    flexDirection: "row",
    justifyContent: 'space-between',
    padding: 5,
    alignItems: "center"
  },

  ruleImage: {
    marginRight: 20
  },

  ruleText: {
    marginRight: 35
  }
});

export default IntroGuidelines;
