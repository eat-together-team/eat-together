// Connections/friends page — your own (with remove) or someone else's
// (read-only), per the "My connections" / "Connections" wireframes.

import React, { useEffect, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";

import { Layout, useTheme } from "../../rapi_ui_components";
import SmallAppBar from "../../components/SmallAppBar";
import UserListItem from "../../components/UserListItem";
import UserListItemSkeleton from "../../components/UserListItemSkeleton";
import EmptyState from "../../components/EmptyState";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import { colorTokens } from "../../theme/colorTokens";

import { db, auth } from "../../provider/Firebase";
import { databaseRemoveFriend } from "../../utils/methods";

const SKELETON_COUNT = 6;

export default function ({ navigation, route }) {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removeTarget, setRemoveTarget] = useState(null); // connection pending removal confirmation
    const viewingUser = route?.params?.viewingUser; // when set, show this user's connections (read-only)

    useEffect(() => {
        const currentUser = auth.currentUser;
        const targetUid = viewingUser?.id ?? currentUser.uid;
        const ref = db.collection("Users").doc(targetUid);

        const unsubscribe = ref.onSnapshot((doc) => {
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
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, [viewingUser?.id]);

    const confirmRemove = () => {
        if (!removeTarget) return;
        databaseRemoveFriend(removeTarget.id);
        setRemoveTarget(null);
    };

    const handleBack = () => {
        if (viewingUser && route?.params?.returnPerson) {
            navigation.navigate("FullProfile", { person: route.params.returnPerson });
        } else {
            navigation.goBack();
        }
    };

    return (
        <Layout>
            <SmallAppBar
                title={viewingUser ? "Connections" : "My connections"}
                onBack={handleBack}
            />

            {loading ? (
                <View style={styles.list}>
                    {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                        <UserListItemSkeleton key={index} />
                    ))}
                </View>
            ) : users.length === 0 ? (
                <EmptyState
                    title="No Friends"
                    text={viewingUser ? "This user has no connections yet." : "Meet new friends on the Explore page!"}
                />
            ) : (
                <FlatList
                    contentContainerStyle={styles.list}
                    keyExtractor={(item) => item.id}
                    data={users}
                    renderItem={({ item }) => (
                        <UserListItem
                            person={{
                                name: item.firstName + " " + item.lastName,
                                image: item.hasImage ? item.image : undefined,
                            }}
                            onPress={() => navigation.navigate("FullProfile", { person: item })}
                            renderRight={
                                !viewingUser && (
                                    <TouchableOpacity onPress={() => setRemoveTarget(item)}>
                                        <Ionicons name="trash-outline" size={22} color={tokens.onBackground} />
                                    </TouchableOpacity>
                                )
                            }
                        />
                    )}
                />
            )}

            <DialogOverlay visible={!!removeTarget} onDismiss={() => setRemoveTarget(null)}>
                <Dialog
                    type="Destructive"
                    title="Remove connection?"
                    primaryButtonText="Remove"
                    secondaryButtonText="Cancel"
                    onPrimaryPress={confirmRemove}
                    onSecondaryPress={() => setRemoveTarget(null)}
                >
                    {removeTarget && (
                        <UserListItem
                            person={{
                                name: removeTarget.firstName + " " + removeTarget.lastName,
                                image: removeTarget.hasImage ? removeTarget.image : undefined,
                            }}
                        />
                    )}
                </Dialog>
            </DialogOverlay>
        </Layout>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 20,
    },
});
