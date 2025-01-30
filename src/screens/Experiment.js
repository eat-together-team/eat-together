// Activity for Cohort program
import React, { useState, useEffect } from "react";
import { 
  ScrollView,
  StyleSheet,
  FlatList,
  View
} from "react-native";
import LargeText from "../components/LargeText";
import Button from "../components/Button";
import NormalText from "../components/NormalText";
import TextInput from "../components/TextInput";
import HorizontalRow from "../components/HorizontalRow";
import Filter from "../components/Filter";

import { db } from "../provider/Firebase";

const pms = ["Eric Xiao", "Megan Louie", "Helen Lan", "Valentina Filizola", "Ian Tsai", "Ananya Vaidyaraman", "Saara Uthmaan"];

export default function ({ navigation }) {
    // State variables, functions

    return (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}>
            <LargeText>Our Cohort PMs:</LargeText>

            {/* JSX Components go here */}

            <View style={styles.row}>
                <Button onPress={() => {
                    navigation.navigate("Landing");
                }} marginVertical={50}>
                    Back
                </Button>
                <Button onPress={() => {
                    navigation.navigate("ExploreCopy");
                }} marginVertical={50}>
                    Explore
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
});