import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Text
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";

import firebase from "firebase/compat";
import { auth, db } from "../provider/Firebase";
//import { id, year, username, profile, degree, timestamp, major} from './Notification';

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
                        <View style={styles.textContainer}>
                            <Text style={styles.username}>{props.person.username}</Text>
                            <View style={styles.tagsContainer}>
                                <Text style={styles.tag}>{props.person.degree}</Text>
                                <Text style={styles.tag}>{props.person.year}</Text>
                                <Text style={styles.tag}>{props.person.major}</Text>
                            </View>
                        </View>
                       
                    </View>
                
                    <View style={styles.response}>
                        <TouchableOpacity onPress={() => {
                            db.collection("User Invites").doc(user.uid).collection("Connections").doc(props.person.id).delete().then(() => {
                                alert("Request Declined");
                            }).catch(() => {
                                alert("Couldn't delete request, try again later.");
                            });
                        }}>
                            <Ionicons name={"close-circle-outline"} size={40} color="red" style={styles.boldIcon}/>
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
                            <Ionicons name={"checkmark-circle-outline"} size={40} color="green" style={styles.boldIcon}/>
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
        shadowColor: "transparent", // removed shadow
        backgroundColor: "transparent", // removed background
        borderRadius: 0,
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
        alignItems: "flex-start",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    headleft: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        flexWrap: "nowrap"
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
    },
    name: {
        marginRight: 10,
    },
    
    textContainer: {
        flexShrink: 1,
        maxWidth: Dimensions.get('window').width * 0.55,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        backgroundColor: '#FFF4D4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 10,
        color: '#333',
        marginRight: 6,
        marginBottom: 4,
    },
    response: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0,
        flexShrink: 0,
        paddingRight: 0,
    },
})

export default MessageList;