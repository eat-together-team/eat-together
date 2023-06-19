import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";

import firebase from "firebase/compat";
import { auth, db } from "../provider/Firebase";

const MessageList = props => {
    const user = auth.currentUser;
    
    return (
        <View style={styles.outline}>
            <TouchableOpacity onPress={props.click}>
                <View style={[styles.head, {
                    backgroundColor: props.color,
                    width: props.width ? props.width : Dimensions.get('screen').width - 40
                }]}>
                    <View style={styles.headleft}>
                        <Image style={styles.image} source={{uri: props.person.profile}}/>
                        <MediumText>
                            {props.person.name.length > 20
                            ? props.person.name.substring(0, 20) + "..."
                            : props.person.name}
                        </MediumText>
                    </View>
                
                    <View style={styles.response}>
                        <TouchableOpacity onPress={() => {
                            db.collection("User Invites").doc(user.uid).collection("Connections").doc(props.person.id).delete().then(() => {
                                alert("Request Declined");
                            }).catch(() => {
                                alert("Couldn't delete request, try again later.");
                            });
                        }}>
                            <Ionicons name={"close-circle-outline"} size={40}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            const user = firebase.auth().currentUser;
                            db.collection("Usernames").doc(props.person.username).get().then((doc) => {
                                // STEP 1: Add friend to current user's data
                                db.collection("Users").doc(user.uid).update({
                                    friendIDs: firebase.firestore.FieldValue.arrayUnion(doc.data().id)
                                }).then(() => {
                                    // STEP 2: Add current user as friend to other user's data
                                    db.collection("Users").doc(doc.data().id).update({
                                        friendIDs: firebase.firestore.FieldValue.arrayUnion(user.uid)
                                    }).then(() => {
                                        // STEP 3: Delete invite
                                        db.collection("User Invites").doc(user.uid).collection("Connections").doc(doc.data().id).delete().then(() => {
                                            props.delete(props.person.id);
                                            alert("Taste Bud Added");
                                        });
                                    })
                                })
                            }).catch(() => {
                                alert("This user seems to no longer exist :(");
                            })
                        }}>
                            <Ionicons name={"checkmark-circle-outline"} size={40}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    outline: {
        marginVertical: 5,
        shadowColor: "#000000",
        backgroundColor: "white",
        borderRadius: 15,
        paddingVertical: 10,
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 10
    },
    head: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headleft: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap"
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginLeft: 15,
        marginRight: 10
    },
    name: {
        marginRight: 20,
    },
    response: {
        marginRight: 25,
        flexDirection: "row"
    }
})

export default MessageList;