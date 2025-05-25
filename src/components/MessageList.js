// Will coome back to this later for the tag functionality

import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";

import firebase from "firebase/compat";
import { auth, db } from "../provider/Firebase";
import SmallText from './SmallText';

const MessageList = props => {
    const user = auth.currentUser;
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    return (
        <View style={styles.outline}>
            <TouchableOpacity onPress={props.click}>
                <View style={[styles.head, {
                    backgroundColor: declined ? "#f5f5f5" : props.color,
                    opacity: declined ? 0.5 : 1,
                    width: props.width ? props.width : Dimensions.get('screen').width - 40,

                }]}>
                    <View style={styles.headleft}>
                        <Image style={styles.image} source={{uri: props.person.profile}}/>
                        <View style={styles.textContainer}>
                            <MediumText style={styles.username}>{props.person.username}</MediumText>
                        </View>
                        {/* Tags for school: will come back to this later */}
                    </View>
                    
                    <View style={styles.actionColumn}>
                        <SmallText style={styles.timestamp}>{props.timestamp}</SmallText>
                        <View style={styles.response}>
                            {!accepted && !declined ?(
                                <>
                                    <TouchableOpacity onPress={() => {
                                        db.collection("User Invites").doc(user.uid).collection("Connections").doc(props.person.id).delete().then(() => {
                                            props.delete(props.person.id);
                                            setDeclined(true);
                                            alert("Request Declined");
                                        }).catch(() => {
                                            alert("Couldn't delete request, try again later.");
                                        });
                                    }}>
                                        <Ionicons name="close-circle-outline" size={40} color="#EA3323" style={styles.boldIcon} />
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => {
                                        db.collection("Usernames").doc(props.person.username).get().then((doc) => {
                                            const otherUserId = doc.data().id;

                                            db.collection("Users").doc(user.uid).update({
                                                friendIDs: firebase.firestore.FieldValue.arrayUnion(otherUserId)
                                            }).then(() => {
                                                db.collection("Users").doc(otherUserId).update({
                                                    friendIDs: firebase.firestore.FieldValue.arrayUnion(user.uid)
                                                }).then(() => {
                                                    db.collection("User Invites").doc(user.uid).collection("Connections").doc(otherUserId).delete().then(() => {
                                                        props.delete(props.person.id);
                                                        setAccepted(true);
                                                        alert("Taste Bud Added");
                                                    });
                                                });
                                            });
                                        }).catch(() => {
                                            alert("This user seems to no longer exist :(");
                                        });
                                    }}>
                                        <Ionicons name="checkmark-circle-outline" size={40} color="#5db075" style={styles.boldIcon} />
                                    </TouchableOpacity>
                                </>
                            ) : accepted ? (
                                <TouchableOpacity onPress={() => alert("Open chat screen here")}>
                                    <Ionicons name="chatbubble-ellipses-outline" size={35} color="#5db075" />
                                </TouchableOpacity>
                            ): null}
                        </View>
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
    timestamp: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 4,
        minHeight: 16,
        textAlign: 'center',
    },
    actionColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: 70,
    },
})

export default MessageList;