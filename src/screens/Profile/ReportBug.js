import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../../provider/Firebase";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";

import SmallAppBar from "../../components/SmallAppBar";
import InformationCard from "../../components/InformationCard";
import TextInputField from "../../components/TextInputField";
import LargeButton from "../../components/LargeButton";

export default function ReportBug({ navigation }) {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];
    const [description, setDescription] = useState("");

    function handleSubmit() {
        db.collection("mail").add({
            to: "eat.together.team@gmail.com",
            message: {
                subject: "BUG REPORT BY: " + auth.currentUser.uid,
                text: description,
            },
        }).then(() => {
            alert("Thank you for reporting this bug. We will look in to it as soon as possible.");
            navigation.goBack();
        });
    }

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Bug report" onBack={() => navigation.goBack()} />
            <View style={styles.content}>
                <View style={styles.top}>
                    <InformationCard text="Please provide as much detail as possible to assist our team in resolving the issue as soon as possible" />
                    <TextInputField
                        hint="Describe the unintended app behavior"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        style={styles.textArea}
                    />
                </View>
                <LargeButton
                    leadingIcon={<Ionicons name="checkmark" size={16} color={tokens.onPrimary} />}
                    onPress={handleSubmit}
                >
                    Submit
                </LargeButton>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingBottom: 40,
        justifyContent: "space-between",
    },
    top: {
        gap: 20,
    },
    textArea: {
        height: 169,
    },
});
