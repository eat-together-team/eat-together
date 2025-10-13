// Will coome back to this later for the tag functionality

import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";
import TagsList from "../components/TagsList";

import firebase from "firebase/compat";
import { auth, db } from "../provider/Firebase";
import { formatDistanceToNow } from "date-fns";

const MessageList = props => {
    const user = auth.currentUser;
    const [accepted, setAccepted] = useState(false);
    const [declined, setDeclined] = useState(false);
    

    useEffect(() => {
        setAccepted(props.accepted || false);
        setDeclined(props.declined || false);
    }, [props.accepted, props.declined]);
    return (
        <View style={styles.outline}>
            <TouchableOpacity onPress={props.click}>
                <View style={[styles.head, {
                    backgroundColor: declined ? "#f5f5f5" : props.color,
                    opacity: declined ? 0.5 : 1,
                    width: props.width ? props.width : Dimensions.get('screen').width - 40,
                    //marginTop: declined ? 10000 : accepted ? 5000 : 0,  --> this should send things to bottom FIX
                }]}>
                    <View style={styles.headleft}>
                        <Image style={styles.image} source={{uri: props.person.profile}}/>
                        <View style={styles.textContainer}>
                            {accepted ? (
                                <MediumText style={styles.username}>Friend request accepted!</MediumText>
                            ) : (
                            <MediumText style={styles.username}>{props.person.username}</MediumText>
                            )}
                        </View>
                        {/* <Tag text="Math" type="school"></Tag> */}
                    </View>
                    
                    <View style={styles.actionColumn}>
                        {props.person.status === 'pending' && props.person.statusUpdatedAt && (
                            <MediumText
                                style={styles.time}
                            >
                                {formatDistanceToNow(props.person.statusUpdatedAt, { addSuffix: true })}
                            </MediumText>
                        )}
                        <View style={styles.response}>
                            {!accepted && !declined ?(
                                <>
                                    <TouchableOpacity onPress={() => {
                                        setDeclined(true);
                                        props.updateStatus(props.person.id, 'declined'); 
                                        //alert("Request Declined");
                                        setTimeout(() => {
                                            db.collection("User Invites").doc(user.uid).collection("Connections").doc(props.person.id).delete().then(() => {
                                                props.delete(props.person.id);
                                            }).catch(() => {
                                                alert("Couldn't delete request, try again later.");
                                            });
                                        }, 86400000);
                                        
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
                                                    setAccepted(true);
                                                    props.updateStatus(props.person.id, 'accepted');
                                                    setTimeout(() => {
                                                        db.collection("User Invites").doc(user.uid).collection("Connections").doc(otherUserId).delete().then(() => {
                                                            
                                                            //alert("Taste Bud Added");
                                                            db.collection("User Invites").doc(user.uid).collection("Connections").doc(otherUserId).delete().then(() => {
                                                                props.delete(props.person.id);
                                                            }).catch(() => {
                                                                alert("Couldn't delete request, try again later.");
                                                            });
                                                            
                                                        });
                                                    }, 86400000);
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
                                    <Ionicons name="chatbubble-ellipses" size={35} color="#5db075" />
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
        marginVertical: 2,      // reduce vertical margin to 2 or 0
        paddingVertical: 5,     // reduce vertical padding inside item to 5 or 0
        shadowColor: "transparent",
        backgroundColor: "transparent",
        borderRadius: 0,
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
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
        borderWidth: 1,
        borderColor: 'black',
    },
    name: {
        marginRight: 10,
    },
    
    textContainer: {
        flexShrink: 1,
        maxWidth: Dimensions.get('window').width * 0.55,
        marginBottom: 2
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
    time: { 
        fontSize: 12,
        color: 'gray',
        alignSelf: 'flex-end',
        marginRight: 0,
        marginBottom: -5,
    }
})

export default MessageList;