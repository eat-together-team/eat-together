// What the Questions page will look like in WYR game

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
import SmallText from "../../../components/SmallText";
import Button from "../../../components/Button";
import BorderedButton from "../../../components/BorderedButton";

import { db, auth } from "../../../provider/Firebase";
import * as firebase from "firebase/compat";

const Question = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
  return (
    <Layout>
      <TopNav
        middleContent={<MediumText left>Question</MediumText>}
        leftContent={
            <View flexDirection={"row"} alignItems={"center"}>
                <Ionicons
                    name="chevron-back"
                    color={"#5DB075"}
                    size={20}
                />
                <SmallText color={"#5DB075"}>Exit</SmallText>
          </View>
        }
        leftAction={() => navigation.navigate("WhileYouEat", {
            event: event})}
      />
      <ScrollView>
        <View style={styles.infoContainer}>
          <LargeText>
            Would You Rather...
          </LargeText>
        
        <View style={styles.option}>
          <Button onPress={() => {
            navigation.navigate("Question", {event: event})
          }}>
            Option A
          </Button>
        </View>

        <MediumText textAlign={"center"}>OR</MediumText>

        <View style={styles.option}>
          <BorderedButton backgroundColor={"grey"} onPress={() => {
            navigation.navigate("Question", {event: event})
          }}>
            Option B
          </BorderedButton>
        </View>
        {/*Do some logic here that moves onto Discussion Guidelines if first time playing,
             Otherwise move onto Discussion/Results page */}
        <View style={styles.nextButton}>
          <Button backgroundColor={"grey"} onPress={() => {
            navigation.navigate("Question", {event: event})
          }}>
            Next
          </Button>
        </View>

        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 30,
    marginVertical: 20,
    marginBottom: 110
  },

  option: {
    marginVertical: 10,
    height: "30%",
  },

  nextButton: {
    // marginVertical: 10,
    // width: 30,
    // height: 5
  }
});

export default Question;
