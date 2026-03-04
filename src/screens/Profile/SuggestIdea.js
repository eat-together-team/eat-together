// Suggest idea screen
import React, { useState } from "react";
import { View, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Layout, TopNav } from "react-native-rapi-ui";
import {Ionicons} from "@expo/vector-icons";

import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";

import admin from "firebase/compat";
import firebase from "firebase/compat";

const SuggestIdea = ({ route, navigation }) => {
    const [report, setReport] = useState('');
    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText center>Suggest Idea</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.page} scrollEnabled={false}>
                <View style={styles.header}>
                    <LargeText style={{padding: 20}} center>Please describe your new idea or feature.</LargeText>
                </View>

                <TextInput
                    multiline={true}
                    width={"100%"}
                    height={130}
                    mainContainerStyle={{alignItems: "flex-start"}}
                    placeholder="Enter explanation here"
                    value={report}
                    onChangeText={val => setReport(val)}
                />

                <Button
                    marginVertical={30}
                    onPress={() => {
                        admin.firestore().collection("mail").add({
                            to: "eat.together.team@gmail.com",
                            message: {
                                subject: "FEATURE SUGGESTION BY: " + firebase.auth().currentUser.uid,
                                text: report,
                            },
                        })
                        .then(() => {
                            alert("Thank you for the suggestion! Happy eating!")
                            navigation.goBack();
                        });
                    }}
                >
                    Submit
                </Button>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    page: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40
    },

    header: {
        backgroundColor: "lemonchiffon",
        width: Dimensions.get('screen').width,
        marginBottom: 20
    }
});

export default SuggestIdea;