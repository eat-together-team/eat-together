// Connections/friends page

import React, { useEffect, useState } from 'react';
import { Layout, TopNav } from 'react-native-rapi-ui';
import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Alert, View } from "react-native";

import EmptyState from "../../components/EmptyState";
import PeopleList from "../../components/PeopleList";
import MediumText from "../../components/MediumText";

import { db, auth } from "../../provider/Firebase";
import { removeFriend } from "../../utils/methods";

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
                        name="arrow-back-sharp"
                        size={24}
                        color="black"
                    ></Ionicons>
                }
                leftAction={() => navigation.goBack()}
            />
            
            <View style={styles.container}>
                {users === null || users.length === 0
                    ? <EmptyState title="No Friends" text="Meet new friends on the Explore page!"/>
                    : <FlatList 
                        contentContainerStyle={styles.invites} 
                        keyExtractor={item => item.id}
                        style={styles.flatList}
                        data={users}
                        renderItem={({item}) =>
                        <PeopleList 
                            person={item} 
                            color="#f2f2f2" 
                            click={() => {
                            navigation.navigate("FullProfile", {
                                person: item
                            });
                        }}
                            onDelete={() => removeFriend(item.id, null)}
                        />
                    }/>
                }
            </View>
        </Layout>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    flatList: {
        backgroundColor: "white",
    },
    invites: {
        alignItems: "center",
        backgroundColor: "white",
    }
});
