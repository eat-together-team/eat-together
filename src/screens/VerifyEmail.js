import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { db, auth } from '../provider/Firebase';
import firebase from 'firebase/compat';

import Button from '../components/Button';
import LargeText from '../components/LargeText';
import NormalText from '../components/NormalText';

const VerifyEmail = props => {
    const user = auth.currentUser;
    const uid = user.uid;
    const [userInfo, setUserInfo] = useState({});
    const [resent, setResent] = useState(false);

    useEffect(() => {
        db.collection('Users').doc(uid).onSnapshot(doc => {
            setUserInfo(doc.data());
        });

        // Every 2 seconds, check if user has verified their email
        let interval = setInterval(() => {
            if (firebase.auth().currentUser) {
                firebase.auth().currentUser.reload().then(() => {
                    if (firebase.auth().currentUser.emailVerified) {
                        props.setCurrUser(firebase.auth().currentUser);
                        clearInterval(interval);
                    }
                });
            }
        }, 2000);
    }, []);

    const resend = () => {
        firebase.auth().currentUser.sendEmailVerification(); // For some reason, user.sendEmailVerification() is undefined
        setResent(true);
    }

    const deleteAccount = () => {
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
                        await user.delete().then(() => {
                            auth.signOut();
                            alert("Account deleted successfully. Sorry to see you go :(");
                        }).catch((error) => {
                            auth.signOut().then(() => {
                                alert("You need to sign in again to proceed.");
                            });
                        });
                    },
                    style: "destructive"
                }
            ]
        );
    }

    return (
        <View style={{
            flex: 1,
            alignItems: "center",
            paddingHorizontal: 20,
            justifyContent: "center"
        }}>
            <LargeText center marginBottom={10}>Check your email inbox to verify your account!</LargeText>
            <NormalText center>If verifying didn't automatically take you to the homescreen,
                log out and then log back in. Also, make sure to check your spam.</NormalText>
            <View style={{marginBottom: 40, marginTop: 30}}>
                <Button onPress={resend} marginVertical={5}>Resend Verification</Button>
                {resent && <NormalText color="#5DB075" center>Sent!</NormalText>}
            </View>

            <Button onPress={() => auth.signOut()} marginVertical={10}>
                Logout
            </Button>
            <Button backgroundColor="red" onPress={deleteAccount}>
                Delete Account
            </Button>
        </View>
    );
}

export default VerifyEmail;