// Activity for Cohort program: adding your name here :)

import React from "react";
import { 
  ScrollView,
  StyleSheet
} from "react-native";
import LargeText from "../components/LargeText";
import Button from "../components/Button";

// TODO: import your component here
import Akash from "./Experiment/Akash";
import Spencer from "./Experiment/Spencer";
import Helen from "./Experiment/Helen";
import Max from "./Experiment/Max";
import Meena from "./Experiment/Meena";

export default function ({ navigation }) {
    return (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}>
            <LargeText>Our Cohort Members:</LargeText>

            {/* TODO: add a View with your name here, and style it however you want ;) */}
            <Akash />
            <Spencer />
            <Helen/>
            <Meena />
            <Max />

            <Button onPress={() => {
                navigation.navigate("Landing");
            }} marginVertical={50}>
                Back
            </Button>
        </ScrollView>
    );
}