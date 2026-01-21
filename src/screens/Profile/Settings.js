import React, { useState, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert, Linking
} from 'react-native';
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from '@expo/vector-icons';

import { db, auth } from "../../provider/Firebase";
import firebase from "firebase/compat";
import "firebase/firestore"

import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import DeviceToken from "../../utils/DeviceToken";
import { Link } from "@react-navigation/native";
import Switch from "../../components/Switch";

export default function ({ navigation }) {
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});
    let [notifs, setNotifs] = useState(false);
    let [privAcct, setPrivAcct] = useState(false);
    let [getRecommendations, setGetRecommendations] = useState(false);
    let [logoutDisabled, setLogoutDisabled] = useState(false); // Prevent the user from logging out "more than once"

    // Fetch current user info
    useEffect(() => {
        if (user) {
            db.collection("Users").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    setUserInfo(doc.data());
                    setNotifs(doc.data().settings.notifications);
                    setGetRecommendations(doc.data().settings.getRecommendations);
                    setPrivAcct(doc.data().settings.privateAccount ? doc.data().settings.privateAccount : false);
                }
            });
        }
    });

    // Changes if user gets notifications or not
    function changeNotifSettings() {
        Linking.openSettings();
    }

    // Changes if user's acount is private or not
    function changePrivacySettings() {
        if (privAcct) {
            db.collection("Users").doc(user.uid).update({
                "settings.privateAccount": false
            });
            setPrivAcct(false);

        } else {
            db.collection("Users").doc(user.uid).update({
                "settings.privateAccount": true
            });
            setPrivAcct(true);

        }
    }


    // Changes if user gets recommendations or not
    function changeRecommendationSettings() {
        Alert.alert(
            "Getting Recommendations",
            "Would you like to get weekly recommendations of meetups? You will be paired up with 3 other users based on your schedule and interests to eat at a restaurant.",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        if (getRecommendations) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.getRecommendations": true
                        });

                        setGetRecommendations(true);
                        alert("Recommendations preference updated!");
                    }
                },
                {
                    text: "No",
                    onPress: async () => {
                        if (!getRecommendations) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.getRecommendations": false
                        });

                        setGetRecommendations(false);
                        alert("Recommendations preference updated!");
                    }
                }
            ]
        );
    }

    async function signOut() {
        if (!logoutDisabled) {
            setLogoutDisabled(true);
            if (DeviceToken.getToken()) await db.collection("Users").doc(user.uid).update({
                pushTokens: firebase.firestore.FieldValue.arrayRemove(DeviceToken.getToken())
            });

            await firebase.auth().signOut();
        }
    }

    function deleteAccount() {
        Alert.alert(
            "Are you sure?",
            "Deleting your account cannot be reversed. Are you sure you want to continue?",
            [
                {
                    text: "No",
                    onPress: () => { },
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        await user.delete().then(() => {
                            signOut();
                            alert("Account deleted successfully. Sorry to see you go :(");
                        }).catch((error) => {
                            signOut().then(() => {
                                alert("You need to sign in again to proceed.");
                            });
                        });
                    },
                    style: "destructive"
                }
            ]
        );
    }

    function changeTutorialSettings() {
        // if yes, set attendingTutorial and tabsTutorial to true, and completeTutorial to false
        // if no, set attendingTutorial and tabsTutorial to false, and completeTutorial to true
        Alert.alert(
            "Tutorial",
            "Would you like to see the tutorial again?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        await db.collection("Users").doc(user.uid).update({
                            "settings.attendingEvent": false,
                            "settings.attendingTutorial": true,
                            "settings.tabsTutorial": true,
                            "settings.completedTutorial": false
                        });

                        alert("Reload the app to see the tutorial again!");
                    }
                },
                {
                    text: "No",
                    onPress: async () => {
                        await db.collection("Users").doc(user.uid).update({
                            "settings.attendingEvent": true,
                            "settings.attendingTutorial": false,
                            "settings.tabsTutorial": false,
                            "settings.completedTutorial": true
                        });
                    }
                }
            ]
        );
    }

    const buttons = [
        {
            name: "Notifications",
            section: "General",
            description: "These include chat messages, meetup recommendations, and event updates",
            toggleState: notifs,
            func: () => changeNotifSettings()
        },
        {
            name: "Private account",
            section: "General",
            description: "Prevent your profile from being discovered in public search and recommendations",
            toggleState: privAcct,
            func: () => changePrivacySettings()
        },
        {
            name: "Recommendations",
            section: "General",
            description: "Receive personalized suggestions for meetups happening around you",
            toggleState: getRecommendations,
            func: () => changeRecommendationSettings()
        },
        {
            name: "Launch tutorial",
            section: "General",
            description: "Learn about the core features of the app and how to get the most out of them",
            icon: "return-up-forward-outline",
            func: () => changeTutorialSettings()
        },
        {
            name: "Privacy Policy",
            section: "Support",
            icon: "shield-outline",
            func: () => { Linking.openURL("https://www.eat-together.org/privacy-policy") }
        },
        {
            name: "Suggest an Idea",
            section: "Support",
            icon: "bulb-outline",
            func: () => { navigation.navigate("Suggest Idea") }
        },
        {
            name: "Report a Bug",
            section: "Support",
            icon: "bug-outline",
            func: () => { navigation.navigate("Report Bug") }
        },
        {
            name: "Log out",
            section: "Account",
            func: () => signOut()
        },
        {
            name: "Delete account",
            section: "Account",
            func: () => deleteAccount()
        }
    ];

    const sections = [
        { title: "General", data: buttons.filter(b => b.section === "General") },
        { title: "Support", data: buttons.filter(b => b.section === "Support") },
        { title: "Account", data: buttons.filter(b => b.section === "Account") },
    ];

    const renderButton = ({ item }) => {
        if (item.section === "General") {
            const isToggle = item.toggleState !== undefined;
            const toggleActive = isToggle && !!item.toggleState;
            const listViewStyle = [
                styles.generalListView,
                toggleActive ? { backgroundColor: "#5DB07521" } : null
            ];
            return (
                <TouchableOpacity onPress={item.func} key={item.name}>
                    <View style={listViewStyle}>
                        <View style={styles.textContainer}>
                            <NormalText size={13} color="black">
                                {item.name}
                            </NormalText>
                            {item.description && (
                                <NormalText size={12} color="gray" style={styles.descriptionText}>
                                    {item.description}
                                </NormalText>
                            )}
                        </View>
                        <View style={styles.actionContainer}>
                            {isToggle ? (
                                <Switch value={item.toggleState} onValueChange={item.func} />
                            ) : (
                                item.icon && (
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={item.name.toLowerCase().includes("delete") ? "red" : "black"}
                                    />
                                )
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        if (item.section === "Support") {
            return (
                <TouchableOpacity onPress={item.func} key={item.name}>
                    <View style={styles.supportListView}>
                        <View style={styles.textContainer}>
                            <NormalText size={13} color="black">
                                {item.name}
                            </NormalText>
                            {item.description && (
                                <NormalText size={12} color="gray" style={styles.descriptionText}>
                                    {item.description}
                                </NormalText>
                            )}
                        </View>
                        <View style={styles.actionContainer}>
                            {item.toggleState !== undefined ? (
                                <Switch value={item.toggleState} onValueChange={item.func} />
                            ) : (
                                item.icon && (
                                    <Ionicons
                                        name={item.icon}
                                        size={20}
                                        color={item.name.toLowerCase().includes("delete") ? "red" : "black"}
                                    />
                                )
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
        if (item.section === "Account") {
            return (
                <TouchableOpacity onPress={item.func} key={item.name}>
                    <View style={[styles.accountListView, { borderColor: item.name === "Delete account" ? "red" : "#5DB075" }]}>
                        <View style={styles.accountTextContainer}>
                            <MediumText size={13} color={item.name === "Delete account" ? "red" : "#5DB075"}>
                                {item.name}
                            </MediumText>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }

    }
    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText center>Settings</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
            <ScrollView
                style={styles.flatlist}
                contentContainerStyle={styles.flatListContent}
            >
                {sections.map((section) => (
                    <View key={section.title}>
                        {section.title === "Account" ? (
                            <View style={{ borderBottomWidth: 0, marginVertical: 4 }} />
                        ) : (
                            <NormalText style={styles.sectionHeader}>{section.title}</NormalText>
                        )}
                        {section.data.map((item, index) => (
                            <View key={item.name + index}>
                                {renderButton({ item })}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </Layout>
    );
}
const styles = StyleSheet.create({
    flatlist: {
    },
    flatListContent: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        paddingBottom: 20
    },

    generalListView: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#80808021",
        borderRadius: 12,
        marginBottom: 9,
        maxHeight: 75
    },
    supportListView: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#80808021",
        borderRadius: 12,
        marginBottom: 9,
        maxHeight: 55
    },
    accountListView: {
        flexDirection: "column",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 2,
        marginBottom: 9,
        maxHeight: 41
    },
    iconContainer: {
        marginRight: 18
    },
    textContainer: {
        flex: 1,
        flexDirection: "column",
        paddingHorizontal: 16,  
        paddingVertical: 13,
        justifyContent: "center"
    },
    actionContainer: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        paddingRight: 16,
    },
    accountTextContainer: {
        paddingHorizontal: 65,  
        paddingVertical: 5,
        justifyContent: "center"
    },
    titleText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#000"
    },
    sectionHeader: {
        color: "#000",
        fontWeight: "700",
        fontSize: 11,
        opacity: 0.5,
        marginTop: 11,
        marginBottom: 7,
        paddingHorizontal: 2
    }
});