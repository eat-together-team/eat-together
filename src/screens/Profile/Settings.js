import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert, Linking
} from 'react-native';
import { Layout, TopNav } from "react-native-rapi-ui";
import { Ionicons } from '@expo/vector-icons';

import { db, auth } from "../../provider/Firebase";
import firebase from "firebase/compat";
import "firebase/firestore"

import MediumText from "../../components/MediumText";
import NormalText from "../../components/NormalText";
import DeviceToken from "../utils/DeviceToken";

export default function ({ navigation }) {
    const user = auth.currentUser;
    const [userInfo, setUserInfo] = useState({});
    let [notifs, setNotifs] = useState(false);
    let [privAcct, setPrivAcct] = useState(false);
    let [logoutDisabled, setLogoutDisabled] = useState(false); // Prevent the user from logging out "more than once"

    // Fetch current user info
    useEffect(() => {
        if (user) {
            db.collection("Users").doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    setUserInfo(doc.data());
                    setNotifs(doc.data().settings.notifications);
                    setPrivAcct(doc.data().settings.privateAccount ? doc.data().settings.privateAccount : false);
                }
            });
        }
    });

    function changeNotifSettings() {
        Alert.alert(
            "Update Notification Settings",
            "Would you like to receive push notifications from Eat Together?",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        if(notifs) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.notifications": true
                        });

                        setNotifs(true);
                        alert("Notification preference updated!");
                    }
                },
                {
                    text: "No",
                    onPress: async () => {
                        if(!notifs) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.notifications": false
                        });

                        setNotifs(false);
                        alert("Notification preference updated!");
                    }
                }
            ]
        );
    }

    function changePrivacySettings() {
        Alert.alert(
            "Update Account Status",
            "Would you like to make your account private? This will prevent your profile from matching with other users on the Explore page; however, you will still be able to be found if a user searches your exact username.",
            [
                {
                    text: "Yes",
                    onPress: async () => {
                        if(privAcct) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.privateAccount": true
                        });

                        setPrivAcct(true);
                        alert("Account status updated!");
                    }
                },
                {
                    text: "No",
                    onPress: async () => {
                        if(!privAcct) return; //Don't display a "changed" animation and alert if nothing changed
                        await db.collection("Users").doc(user.uid).update({
                            "settings.privateAccount": false
                        });

                        setPrivAcct(false);
                        alert("Account status updated!");
                    }
                }
            ]
        );
    }

    async function signOut () {
        if (!logoutDisabled) {
            setLogoutDisabled(true);
            if (DeviceToken.getToken()) await db.collection("Users").doc(user.uid).update({
                pushTokens: firebase.firestore.FieldValue.arrayRemove(DeviceToken.getToken())
            });

            await firebase.auth().signOut();
        }
    }

    function deleteAccount () {
        Alert.alert(
            "Are you sure?",
            "Deleting your account cannot be reversed. Are you sure you want to continue?",
            [
                {
                    text: "No",
                    onPress: () => {},
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        console.log("here");
                        const uid = user.uid;
                        console.log("here2");
                        console.log(uid);
                        const info = userInfo;
                        // const user = firebase.auth().currentUser;

                        // Delete their uid from all friends in database
                        info.friendIDs.forEach(friend => {
                            db.collection("Users").doc(friend).update({
                                friendIDs: firebase.firestore.FieldValue.arrayRemove(uid)
                            });
                        });

                        // Delete image from storage
                        if (info.hasImage) {
                            const ref = storage.ref().child(`profilePictures/${uid}`);
                            await ref.delete();
                        }                        

                        user.delete();
                        db.collection("Usernames").doc(info.username).delete();
                        
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

    const buttons = [
        {
            name: " Notification Preferences" + (notifs ? " (ON)" : " (OFF)"),
            icon: "notifications",
            func: () => changeNotifSettings()
        },
        {
            name: " Private Account" + (privAcct ? " (ON)" : " (OFF)"),
            icon: "shield",
            func: () => changePrivacySettings()
        },
        {
            name: " Privacy Policy",
            icon: "hand-left",
            func: () => {Linking.openURL("https://www.eat-together.tech/privacy-policy")}
        },
        {
            name: " Report a Bug",
            icon: "bug",
            func: () => {navigation.navigate("Report Bug")}
        },
        {
            name: " Suggest an Idea",
            icon: "bulb",
            func: () => {navigation.navigate("Suggest Idea")}
        },
        {
            name: " Log Out",
            icon: "log-out",
            func: () => signOut()
        },
        {
            name: " Delete Account",
            icon: "trash",
            func: () => deleteAccount()
        }
    ]

    const renderButton = ({ item }) => (
        <TouchableOpacity onPress={item.func}>
            <View style={styles.listView}>
                <Ionicons name = {item.icon} size = {25}
                    color={item.name.toLowerCase().includes("delete") ? "red" : "black"}/>
                <NormalText size={16} color={item.name.toLowerCase().includes("delete") ? "red" : "black"}>
                    {item.name}
                </NormalText>
            </View>
        </TouchableOpacity>
    )
    return(
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
            <FlatList data={buttons} renderItem={renderButton} style={styles.flatlist} scrollEnabled={false}/>
        </Layout>
    );
}
const styles = StyleSheet.create({
    flatlist: {
        marginVertical: 10,
        marginHorizontal: 10
    },

    listView: {
        flexDirection: "row",
        paddingVertical: 15,
        alignItems: "center",
    }
});
