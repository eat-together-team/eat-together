import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import { db, auth } from "../../provider/Firebase";

import SmallAppBar from "../../components/SmallAppBar";
import SettingsRow from "../../components/SettingsRow";

export default function Recommendations({ navigation }) {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];
    const user = auth.currentUser;
    const [personalizeSuggestions, setPersonalizeSuggestions] = useState(true);

    useEffect(() => {
        db.collection("Users").doc(user.uid).get().then((doc) => {
            setPersonalizeSuggestions(doc.data()?.settings?.getRecommendations ?? true);
        });
    }, []);

    const handleValueChange = (value) => {
        setPersonalizeSuggestions(value);
        db.collection("Users").doc(user.uid).update({
            "settings.getRecommendations": value,
        });
    };

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Recommendations" onBack={() => navigation.goBack()} />
            <View style={styles.content}>
                <View style={[styles.illustration, { backgroundColor: tokens.containerMedium }]}>
                    <View style={[styles.phone, { backgroundColor: tokens.background }]}>
                        <View style={[styles.notch, { backgroundColor: tokens.containerMedium }]} />
                        <View style={styles.column}>
                            <View style={[styles.card, { backgroundColor: tokens.primaryContainerLow }]}>
                                <View style={[styles.iconCircle, { backgroundColor: tokens.primaryContainer }]}>
                                    <Ionicons name="sparkles" size={12} color={tokens.primary} />
                                </View>
                            </View>
                            <View style={[styles.lineShort, { backgroundColor: tokens.containerMedium }]} />
                            <View style={[styles.lineLong, { backgroundColor: tokens.containerMedium }]} />
                        </View>
                    </View>
                </View>

                <SettingsRow
                    testID="settings-row-personalize-suggestions"
                    title="Personalize suggestions"
                    subtitle="Receive personalized suggestions for meetups happening around you"
                    accessory="switch"
                    value={personalizeSuggestions}
                    onValueChange={handleValueChange}
                />
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
        gap: 25,
    },
    illustration: {
        width: "100%",
        height: 206,
        borderRadius: radiusTokens.small,
        alignItems: "center",
        justifyContent: "flex-end",
        overflow: "hidden",
    },
    phone: {
        width: 186,
        height: 167,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: "center",
        paddingTop: 7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    notch: {
        width: 53,
        height: 14,
        borderRadius: 20,
    },
    column: {
        width: 163,
        marginTop: 18,
        alignItems: "flex-start",
    },
    card: {
        width: 163,
        height: 84,
        borderRadius: radiusTokens.small,
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: 7,
    },
    iconCircle: {
        width: 25,
        height: 25,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    lineShort: {
        width: 76,
        height: 7,
        borderRadius: 20,
        marginTop: 7,
    },
    lineLong: {
        width: 122,
        height: 7,
        borderRadius: 20,
        marginTop: 3,
    },
});
