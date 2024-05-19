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
    const green = "#5DB075";
    const votes_A = 20;
    const votes_B = 30;
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
        leftAction={() => navigation.navigate("WhileYouEat", {
            event: event})}
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
        
        {/*Should disable buttons after choosing one*/}
        <View>
            <MediumText paddingHorizontal={15}>option A: some really long option</MediumText>
            <MediumText style={[styles.option, styles.optionA]} color={"white"}>
                {votes_A}/{votes_A+votes_B}
            </MediumText>
            <MediumText paddingHorizontal={15}>option B: some really long option</MediumText>
            <MediumText style={[styles.option, styles.optionB]} color={green}>
                {votes_B}/{votes_A+votes_B}
            </MediumText>
            {/*Do some logic here that moves everyone onto discussion page */}
            <View style={styles.nextButton}>
                <Button backgroundColor={"gray"} onPress={() => {
                    navigation.navigate("Question", {event: event})
                }}>
                    Next Question
                </Button>
            </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  
  option: {
    // paddingHorizontal: 80,
    paddingVertical: 8,
    marginVertical: 20, 
    marginHorizontal: 20,
    bottom: 10,
    // width: "auto",
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
