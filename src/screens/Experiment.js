// Activity for Cohort program: adding your name here :)
import React, {useState} from "react";
import { 
  ScrollView,
  StyleSheet
} from "react-native";
import LargeText from "../components/LargeText";
import Button from "../components/Button";
import { TextInput } from "react-native-gesture-handler";
import { FlatList } from "react-native-gesture-handler";

// TODO: import your component here
import Chaitanya from "./Experiment/Chaitanya";
import Akash from "./Experiment/Akash";
import Spencer from "./Experiment/Spencer";
import Helen from "./Experiment/Helen";
import Max from "./Experiment/Max";
import Meena from "./Experiment/Meena";

const members = ["Eric Xiao", "Meena Kudava", "Max Lan", "Eric Kumar", "Jacob Lai", "Brendan Shen"];


export default function ({ navigation }) {
    const [text, setText] = useState("");
    const onChange = text => {
        setText(text);
    }
    
    return (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}>
            <LargeText>Our Cohort Members:</LargeText>

            {/* TODO: add a View with your name here, and style it however you want ;) */}
            <Chaitanya />
            <Akash />
            <Spencer />
            <Helen/>
            <Meena />
            <Max />

            <TextInput value={text} onChangeText={onChange} placeholder="Type here" marginTop={10}></TextInput>
            <NormalText>Typed: {text}</NormalText>

            {/*Using .map:*/ filteredMembers.map((member, index) => (
            <NormalText key={index}>{member}</NormalText>
            ))}
            {/*Using FlatList:*/}
            <FlatList renderItem={({ item }) => <NormalText>{item}</NormalText>} data={members} keyExtractor={(item, index) => index.toString()}/>

            <Button onPress={() => {
                navigation.navigate("Landing");
            }} marginVertical={50}>
                Back
            </Button>
        </ScrollView>
    );
}