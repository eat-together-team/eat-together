//Look at your connection requests

import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from "react-native";
import { Layout, TopNav } from 'react-native-rapi-ui';
import { Ionicons } from "@expo/vector-icons";

import LoadingView from '../../components/LoadingView';
import EmptyState from '../../components/EmptyState';
import MessageList from "../../components/MessageList";
import MediumText from "../../components/MediumText";

import { db } from "../../provider/Firebase";
import firebase from "firebase/compat";

export default function ({ back, navigation }) {
    const user = firebase.auth().currentUser;
    const [requests, setRequests] = useState([]); // Requests
    const [loading, setLoading] = useState(true); // Loading state for the page

    useEffect(() => {
        const ref = db.collection("User Invites").doc(user.uid).collection("Connections");

        ref.onSnapshot(async (query) => {
            const list = await Promise.all(
            query.docs.map(async (doc) => {
                const data = doc.data();
                const userDoc = await db.collection("Users").doc(doc.id).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                return {
                    id: doc.id,
                    name: data.name,
                    username: data.username,
                    profile: data.profile,
                    tags: userData.tags || []
                };
            })
            );

            setRequests(list);
            setLoading(false);
        });
    }, []);

    const deleteRequest = (id) => {
        const newRequests = requests.filter((request) => request.id !== id);
        setRequests(newRequests);
    }

    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText center>Friend Requests</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />

            {loading ?
                <LoadingView/>
            : requests.length > 0 ?
                <FlatList contentContainerStyle={styles.invites} keyExtractor={item => item.id}
                        data={requests} renderItem={({item}) =>
                    <MessageList person={item} styles={styles.profile} click={() => {
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
                    }} delete={deleteRequest}/>
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
        padding: 10,
        width: "100%"
        
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
    
});

