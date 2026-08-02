import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "@react-navigation/native";

import { Layout } from "../../rapi_ui_components";
import { db, auth } from "../../provider/Firebase";

import SmallAppBar from "../../components/SmallAppBar";
import SettingsRow from "../../components/SettingsRow";
import InformationCard from "../../components/InformationCard";

export default function NotificationsSettings({ navigation }) {
    const user = auth.currentUser;
    const [permissionGranted, setPermissionGranted] = useState(true);
    const [chatMessages, setChatMessages] = useState(true);
    const [events, setEvents] = useState(true);
    const [diningExchanges, setDiningExchanges] = useState(true);
    const [friendRequests, setFriendRequests] = useState(true);

    // Re-check on every focus so returning from system settings (after
    // toggling the OS permission) updates the screen immediately.
    useFocusEffect(
        useCallback(() => {
            Notifications.getPermissionsAsync().then(({ status }) => {
                setPermissionGranted(status === "granted");
            });
        }, [])
    );

    useEffect(() => {
        db.collection("Users").doc(user.uid).get().then((doc) => {
            const notifications = doc.data()?.settings?.notifications || {};
            setChatMessages(notifications.chatMessages ?? true);
            setEvents(notifications.events ?? true);
            setDiningExchanges(notifications.diningExchanges ?? true);
            setFriendRequests(notifications.friendRequests ?? true);
        });
    }, []);

    // These preferences aren't enforced anywhere yet — this app has no push
    // notification sending in place (tokens are collected but never used),
    // so there's nothing to actually gate on them today. They're persisted
    // so the choice is remembered for whenever that's built.
    const updatePreference = (field, setter) => (value) => {
        setter(value);
        db.collection("Users").doc(user.uid).update({
            [`settings.notifications.${field}`]: value,
        });
    };

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Notifications" onBack={() => navigation.goBack()} />
            <View style={styles.content}>
                {!permissionGranted && (
                    <InformationCard
                        type="Action"
                        text="Turn on push notifications to receive updates"
                        actionText="Go to system settings"
                        onAction={() => Linking.openSettings()}
                    />
                )}
                <View
                    style={[styles.rows, !permissionGranted && styles.rowsDisabled]}
                    pointerEvents={permissionGranted ? "auto" : "none"}
                >
                    <SettingsRow
                        testID="settings-row-chat-messages"
                        title="Chat messages"
                        subtitle="Receive notifications when you receive messages and message requests"
                        accessory="switch"
                        value={permissionGranted && chatMessages}
                        onValueChange={updatePreference("chatMessages", setChatMessages)}
                    />
                    <SettingsRow
                        testID="settings-row-events"
                        title="Events"
                        subtitle="Receive notifications about event invites and recommendations"
                        accessory="switch"
                        value={permissionGranted && events}
                        onValueChange={updatePreference("events", setEvents)}
                    />
                    <SettingsRow
                        testID="settings-row-dining-exchanges"
                        title="Dining exchanges"
                        subtitle="Get notified about the status of ongoing exchanges and when someone requests to exchange"
                        accessory="switch"
                        value={permissionGranted && diningExchanges}
                        onValueChange={updatePreference("diningExchanges", setDiningExchanges)}
                    />
                    <SettingsRow
                        testID="settings-row-friend-requests"
                        title="Friend requests"
                        subtitle="Receive notifications when others request to connect with you"
                        accessory="switch"
                        value={permissionGranted && friendRequests}
                        onValueChange={updatePreference("friendRequests", setFriendRequests)}
                    />
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 18,
    },
    rows: {
        gap: 4,
    },
    rowsDisabled: {
        opacity: 0.5,
    },
});
