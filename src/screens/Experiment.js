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

export default function ({ navigation }) {
    // State variables, functions
    const [text, setText] = useState("");
    const onChange = text => {
        setText(text);
    }

    const pms = ["Megan Louie", "Helen Lan", "Valentina Filizola", "Ian Tsai", "Ananya Vaidyaraman", "Saara Uthmaan"];

    const [longName, setLongName] = useState(false);
    const [shortName, setShortName] = useState(false);
    const [filteredPms, setFilteredPms] = useState([]);
        
    useEffect(() => {
        let newPms = pms.filter((pm) => {
            if (!longName && !shortName) {
                return true;
            }
            if (longName && pm.length > 10) {
                return true;
            }
            if (shortName && pm.length <= 10) {
                return true;
            }
            return false;
        });
        setFilteredPms(newPms);
    }, [longName, shortName]);

    const [events, setEvents] = useState([]);
    useEffect(() => {
        db.collection("Public Events").onSnapshot((query) => {
            let newEvents = [];
            query.forEach((doc) => {
                newEvents.push(doc.data().name);
            });

            setEvents(newEvents);
        });
    }, []);

    const addUsername = username => {
        if (username === "") {
            return;
        }
        db.collection("WorkshopUsernames").doc(username).update({
            newId: "workshop" + Date.now()
        }).then(() => {
            alert("Document successfully written!");
            setText("");
        }).catch((error) => {
            alert("Error writing document: " + error);
            setText("");
        });
    }    


    return (
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 20 }}>
            <LargeText>Our Cohort PMs:</LargeText>

            {/* JSX Components go here */}
            <TextInput value={text} onChangeText={onChange} placeholder="Type username ..." marginTop={10}/>
            <NormalText>Type: {text}</NormalText>

            <Button onPress={() => addUsername(text)} marginVertical={10}>Add Username</Button>

            <HorizontalRow>
                <Filter checked={longName} onPress={() => {
                    setLongName(!longName);
                    setShortName(false);
                }} text="Long Names"/>
                <Filter checked={shortName} onPress={() => {
                    setLongName(false);
                    setShortName(!shortName);
                }} text="Short Names"/>
            </HorizontalRow>


            {events.slice(0, 10).map((event, index) => (
                <NormalText key={index}>{event}</NormalText>
            ))}

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