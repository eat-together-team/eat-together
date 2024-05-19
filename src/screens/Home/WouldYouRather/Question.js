// Question screen displays question and answer options for user selection

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
import { Touchable } from "react-native";

const Question = ({ route, navigation }) => {
    const [event, setEvent] = useState(route.params.event);
    const [isDisabled, setDisabled] = useState(false);
    const green = "#5DB075";
  return (
    <Layout>
      <TopNav
        middleContent={<MediumText left>Question</MediumText>}
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
        leftAction={() => navigation.navigate("WhileYouEat", {
            event: event})}
      />
      <ScrollView>
        <View style={styles.infoContainer}>
          <LargeText>
            Would You Rather...
          </LargeText>
        </View>
        
        {/*Should disable buttons after choosing one*/}
        <View style={styles.options}>
            <Button onPress={() => {
                navigation.navigate("Question", {event: event})
            }}>
                option A: some really long option that takes up a lot of space
            </Button>

            <View marginVertical={15} alignSelf={"center"}><MediumText>OR</MediumText></View>

            <BorderedButton disabled={isDisabled}>
            {/* onPress={() => {
                navigation.navigate("Question", {event: event})
            }}> */}
                option B: some really long option that takes up a lot space
            </BorderedButton>
        
            {/*Do some logic here that moves everyone onto discussion page */}
            <View style={styles.nextButton}>
                <Button backgroundColor={"grey"} onPress={() => {
                    navigation.navigate("Discussion", {event: event})
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
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20
  },

  options: {
    marginVertical: 10,
    padding: 20
  },

  nextButton: {
    top: 20,
    marginVertical: 20,
    width: 130,
    height: 60,
    flexDirection: "column",
    alignSelf: "flex-end",
  }
});

export default Question;
