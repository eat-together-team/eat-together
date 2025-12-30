import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Layout, TextInput, TopNav } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import MediumText from "../../components/MediumText";
import PeopleList from "../../components/PeopleList";

import { db, auth } from "../../provider/Firebase";
import { checkProfanity, generateColor } from "../../methods";

export default function ({route, navigation}) {
    let group = route.params.group;
    let user = auth.currentUser;
    const [users, setUsers] = useState([]);

    const [chatName, setChatName] = useState(group.name);

    useEffect(() => {
        db.collection("Groups").doc(group.groupID).onSnapshot((doc) => {
            if (doc.data()) { // Checks if doc exists (used to prevent crash after blocking a user)
                let userIDs;
                let userList = [];
                userIDs = doc.data().uids;
                userIDs.forEach((uid) => {
                    if(uid == user.uid) return;
                    db.collection("Users").doc(uid).get().then((doc) => {
                        userList.push(doc.data());
                    }).then(() => {
                        setUsers(userList);
                    });
                })
            }
        })
    }, [])
    return(
        <Layout>
            <TopNav
                middleContent={<MediumText>View Group Details</MediumText>}
                leftContent={<Ionicons name="chevron-back" size={20} />}
                leftAction={() => {
                    navigation.goBack();
                }}
            />
            <View style={styles.chatName}>
                <View style = {styles.groupName}>
                    <MediumText size={14}>Group name: </MediumText>
                </View>
                <TextInput
                    placeholder="Group Name"
                    onChangeText={(val) => setChatName(val)}
                    value={chatName}
                    containerStyle={{ width: "75%" }}
                    onEndEditing={() => {
                        if(checkProfanity(chatName)) {
                            alert("Please do not use profane words in the chat name.");
                            return;
                        }
                        db.collection("Groups").doc(group.groupID).update({
                            name: chatName
                        }).then(() => {
                            alert("Chat name changed!");
                            navigation.navigate("Chats");
                        })
                    }}
                />
            </View>
            <View style = {styles.list}>
                <FlatList contentContainerStyle={styles.invites} keyExtractor={item => item.id}
                          data={users} renderItem={({item}) =>
                    <PeopleList person={item} color={generateColor()} click={() => {
                        navigation.navigate("FullProfile", {
                            person: item
                        });
                    }}/>
                }/>
            </View>
        </Layout>
    )
}

const styles = StyleSheet.create({
    chatName: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 20,
        paddingHorizontal: 20,
        paddingTop: 10
    },
    groupName: {
        paddingRight: 10,
    },
    invites: {
        alignItems: "center",
        padding: 30
    },
    list: {
        marginVertical: -20
    }
})