// Connections/friends page

import React, { useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, View, StatusBar, Platform, TouchableOpacity } from "react-native";
import Constants from 'expo-constants';

import EmptyState from "../../components/EmptyState";
import PeopleList from "../../components/PeopleList";
import MediumText from "../../components/MediumText";

import { db, auth } from "../../provider/Firebase";
import { removeFriend } from "../../utils/methods";

export default function ({ navigation, route }) {
    const [users, setUsers] = useState([]);
    const viewingUser = route?.params?.viewingUser; // when set, show this user's connections (read-only)

    useEffect(() => {
        const currentUser = auth.currentUser;
        const targetUid = viewingUser?.id ?? currentUser.uid;
        const ref = db.collection("Users").doc(targetUid);

        ref.onSnapshot((doc) => {
            const friends = doc.data()?.friendIDs ?? [];
            const promises = friends.map((uid) => {
                const userRef = db.collection("Users").doc(uid);
                return userRef.get().then((snap) => {
                    if (snap.exists) {
                        return { ...snap.data(), id: uid };
                    }
                    return null;
                }).catch((e) => console.log(e));
            });

            Promise.all(promises).then((list) => {
                setUsers(list.filter((u) => u != null));
            });
        });
    }, [viewingUser?.id]);

    const statusBarHeight = Constants.statusBarHeight || (Platform.OS === 'ios' ? 44 : 24);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
            <View style={[styles.header, { paddingTop: statusBarHeight + 40 }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (viewingUser && route?.params?.returnPerson) {
                            navigation.navigate("FullProfile", { person: route.params.returnPerson });
                        } else {
                            navigation.goBack();
                        }
                    }}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back-sharp"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <MediumText center>
                        {viewingUser ? `${viewingUser.firstName || "User"}'s Connections` : "Connections"}
                    </MediumText>
                </View>
                <View style={styles.backButton} />
            </View>
            
            <View style={styles.container}>
                {users === null || users.length === 0
                    ? <EmptyState
                        title="No Friends"
                        text={viewingUser ? "This user has no connections yet." : "Meet new friends on the Explore page!"}
                    />
                    : <FlatList 
                        contentContainerStyle={styles.invites} 
                        keyExtractor={item => item.id}
                        style={styles.flatList}
                        data={users}
                        renderItem={({ item }) => (
                            <PeopleList 
                                person={item} 
                                color="#f2f2f2" 
                                click={() => navigation.navigate("FullProfile", { person: item })}
                                onDelete={viewingUser ? undefined : () => removeFriend(item.id, null)}
                            />
                        )}
                    />
                }
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "white",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        width: 40,
        alignItems: "flex-start",
    },
    headerTitle: {
        flex: 1,
        alignItems: "center",
    },
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
