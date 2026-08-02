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

export default function SuggestIdea({ navigation }) {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];
    const [description, setDescription] = useState("");

    function handleSubmit() {
        db.collection("mail").add({
            to: "eat.together.team@gmail.com",
            message: {
                subject: "FEATURE SUGGESTION BY: " + auth.currentUser.uid,
                text: description,
            },
        }).then(() => {
            alert("Thank you for the suggestion! Happy eating!");
            navigation.goBack();
        });
    }

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Feature suggestion" onBack={() => navigation.goBack()} />
            <View style={styles.content}>
                <View style={styles.top}>
                    <InformationCard text="Provide more details on the feature you intend to request" />
                    <TextInputField
                        hint="Feature description"
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
        height: 177,
    },
});
