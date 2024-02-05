// Activity for Cohort program: adding your name here :)

import React from "react";
import { 
  ScrollView,
  View,
  StyleSheet
} from "react-native";
import LargeText from "../components/LargeText";
import NormalText from "../components/NormalText";
import Button from "../components/Button";

export default function ({ navigation }) {
    return (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}>
            <LargeText>Our Cohort Members:</LargeText>

            {/* TODO: add a View with your name here, and style it however you want ;) */}
            <View style={styles.eric}>
                <NormalText>Eric Xiao :)</NormalText>
            </View>

            <Button onPress={() => {
                navigation.navigate("Landing");
            }} marginVertical={50}>
                Back
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    eric: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightblue"
    }
});