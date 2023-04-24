//Look at your connections

import React, {useEffect, useState} from 'react';
import {Layout, Text, TopNav} from 'react-native-rapi-ui';
import {Ionicons} from "@expo/vector-icons";
import HorizontalSwitch from "../../components/HorizontalSwitch";
import {db} from "../../provider/Firebase";
import {FlatList, StyleSheet, View} from "react-native";
import PeopleList from "../../components/PeopleList";
import {generateColor} from "../../methods";
import firebase from "firebase/compat";
import NormalText from "../../components/NormalText";
import MediumText from "../../components/MediumText";

export default function ({ navigation }) {
    const [users, setUsers] = useState([]); // initial state, function used for updating initial state

    //Check to see if we should display the "No Connections" placeholder text
    function shouldDisplayPlaceholder(list) {
        if(list == null ||list.length === 0) {
            return "No connections. Meet friends on the Explore page!"
        } else {
            return ""
        }
    }

    useEffect(() => { // updates stuff right after React makes changes to the DOM
        const user = firebase.auth().currentUser;
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

            <View style = {styles.noConnectionsView}>
                <NormalText center={"center"}>{shouldDisplayPlaceholder(users)}</NormalText>
            </View>
            
            <FlatList contentContainerStyle={styles.invites} keyExtractor={item => item.id}
                    data={users} renderItem={({item}) =>
                <PeopleList person={item} color="white" click={() => {
                    navigation.navigate("FullProfile", {
                        person: item
                    });
                }}/>
            }/>

        </Layout>

    );
}

const styles = StyleSheet.create({
    invites: {
        alignItems: "center",
    },
    submit: {
        position: 'absolute',
        bottom:0,
    },
    switchView: {
        marginVertical: 10
    }
});
