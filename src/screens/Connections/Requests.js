//Look at your connection requests

import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, } from "react-native";
import { Layout, TopNav } from 'react-native-rapi-ui';
import { Ionicons } from "@expo/vector-icons";

import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import MessageList from "../../components/MessageList";
import MediumText from "../../components/MediumText";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";
import { formatDistanceToNow } from "date-fns";

export default function ({ back, navigation}) {
    const user = firebase.auth().currentUser;
    const [requests, setRequests] = useState([]); // Requests
    const [loading, setLoading] = useState(true); // Loading state for the page

    useEffect(() => { // updates stuff right after React makes changes to the DOM
        const ref = db.collection("User Invites").doc(user.uid).collection("Connections");
        ref.onSnapshot((query) => {
            const list = [];
            query.forEach((doc) => {
                let data = doc.data();
                const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();  // ignore for now              
                list.push({
                    id: doc.id,
                    name: data.name,
                    username: data.username,
                    profile: data.profile,
                    timestamp: timestamp, // ignore for now
                    status: data.status || 'pending', 
                    statusUpdatedAt: data.statusUpdatedAt?.toDate ? data.statusUpdatedAt.toDate() : null,
                });
                console.log(list);
            });
            setRequests(list);
            setLoading(false);
        });
    }, []);

    const deleteRequest = (id) => {
        const newRequests = requests.filter((request) => request.id !== id);
        setRequests(newRequests);
    }

    const updateStatus = (id, newStatus) => {
        setRequests(prev =>
            prev.map(r => (r.id === id ? { ...r, status: newStatus, statusUpdatedAt: new Date() } : r))
        );
        db.collection("User Invites").doc(user.uid).collection("Connections").doc(id).update({
            status: newStatus,
            statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(() => {
            alert("Failed to update request status in database.");
        });
    };

    const sortedRequests = [...requests].sort((a, b) => {
        const statusOrder = { pending: 0, accepted: 1, declined: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        if (a.statusUpdatedAt && b.statusUpdatedAt) {
            return a.statusUpdatedAt - b.statusUpdatedAt;
        }
        return 0;
    });

    return (
        <Layout>
            <View style={styles.navContainer}>
                <TouchableOpacity onPress={() => {
                    // Reset accepted/declined requests to pending before going back
                    // For testing purpose
                    requests.forEach(request => {
                        if(request.status === 'accepted' || request.status === 'declined') {
                            db.collection("User Invites").doc(user.uid)
                            .collection("Connections").doc(request.id)
                            .update({
                                status: 'pending',
                                statusUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        }
                    });
                    navigation.goBack();
                }}>
                    <Ionicons name="chevron-back" size={24} color="black" style = {styles.backButton}/>
                </TouchableOpacity>
                <MediumText style={styles.navTitle}>Friend Requests</MediumText>
            </View>
            {loading ?
                <LoadingView/>
            : requests.length > 0 ?
                <FlatList contentContainerStyle={styles.invites} keyExtractor={item => item.id}
                        data={sortedRequests} renderItem={({item}) =>
                    <MessageList person={item} 
                                timestamp={formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                click={() => {
                        db.collection("Users").doc(item.id).get().then((doc) => {
                            if (doc.data()) {
                                navigation.navigate("FullProfile", {
                                    person: doc.data()
                                });
                            } else {
                                alert("This user seems to no longer exist :(");
                            }
                        }).catch(() => {
                            alert("This user seems to no longer exist :(");
                        });
                    }} delete={deleteRequest} 
                    updateStatus={updateStatus}
                    accepted={item.status === 'accepted'}
                    declined={item.status === 'declined'}/>
                }/>
            :
                <EmptyState title="No Requests" text="You look great today :)"/>
            }
        </Layout>

    );
}

const styles = StyleSheet.create({
    invites: {
        alignItems: "center",
        paddingVertical: 0,
        paddingHorizontal: 5,
    },
    submit: {
        position: 'absolute',
        bottom:0,
    },
    switchView: {
        marginVertical: 10
    },
    noRequestsView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 5,
    },
    navContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    navTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: 0,
        paddingTop: 20
    },
    backButton: {
        paddingTop: 12
    }
});