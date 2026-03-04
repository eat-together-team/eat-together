// Connections/friends page

import React, { useEffect, useState } from 'react';
import { Layout, TopNav } from 'react-native-rapi-ui';
import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet } from "react-native";

import EmptyState from "../../components/EmptyState";
import PeopleList from "../../components/PeopleList";
import MediumText from "../../components/MediumText";

import { db, auth } from "../../provider/Firebase";

export default function ({ navigation }) {
    const [users, setUsers] = useState([]); // initial state, function used for updating initial state

    useEffect(() => { // updates stuff right after React makes changes to the DOM
        const user = auth.currentUser;
        const ref = db.collection("Users").doc(user.uid);
        ref.onSnapshot((doc) => {
            const friends = doc.data().friendIDs;
            let promises = friends.map((uid) => {
                const userRef = db.collection('Users').doc(uid);
                return userRef.get().then((onSnapshot) => {
                if (onSnapshot.exists) {
                    return onSnapshot.data();
                }
                }).catch((e) => console.log(e));
            });
            
            Promise.all(promises).then((list) => {
                setUsers(list.filter((user) => user != null));
            });
        });
    }, []);

    return (
        <Layout>
            <TopNav
                middleContent={
                    <MediumText center>Connections</MediumText>
                }
                leftContent={
                    <Ionicons
                        name="chevron-back"
                        size={20}
                    />
                }
                leftAction={() => navigation.goBack()}
            />
            
            {users === null || users.length === 0
                ? <EmptyState title="No Friends" text="Meet new friends on the Explore page!"/>
                : <FlatList contentContainerStyle={styles.invites} keyExtractor={item => item.id}
                    data={users} renderItem={({item}) =>
                    <PeopleList person={item} color="white" click={() => {
                        navigation.navigate("FullProfile", {
                            person: item
                        });
                    }}/>
                }/>
            }

        </Layout>

    );
}

const styles = StyleSheet.create({
    invites: {
        alignItems: "center",
    }
});
