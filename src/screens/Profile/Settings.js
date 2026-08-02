import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../../provider/Firebase";
import firebase from "firebase/compat";
import "firebase/firestore";

import { Layout, useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import DeviceToken from "../../utils/DeviceToken";
import { bridgeSignOut } from "../../utils/nativeAuthBridge";

import SmallAppBar from "../../components/SmallAppBar";
import SettingsRow from "../../components/SettingsRow";
import Divider from "../../components/Divider";
import Dialog from "../../components/Dialog";
import DialogOverlay from "../../components/DialogOverlay";
import LabelText from "../../components/typography/LabelText";
import SubBodyText from "../../components/typography/SubBodyText";

export default function Settings({ navigation }) {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];
    const user = auth.currentUser;
    // Prevent the user from logging out "more than once"
    const [logoutDisabled, setLogoutDisabled] = useState(false);
    const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

    async function performSignOut() {
        if (logoutDisabled) return;
        setLogoutDisabled(true);

        if (DeviceToken.getToken()) {
            await db.collection("Users").doc(user.uid).update({
                pushTokens: firebase.firestore.FieldValue.arrayRemove(DeviceToken.getToken())
            });
        }

        await firebase.auth().signOut();
        await bridgeSignOut();
    }

    function handleLogoutConfirm() {
        setLogoutDialogVisible(false);
        performSignOut();
    }

    async function handleDeleteConfirm() {
        setDeleteDialogVisible(false);
        try {
            await user.delete();
            await performSignOut();
            alert("Account deleted successfully. Sorry to see you go :(");
        } catch (error) {
            await performSignOut();
            alert("You need to sign in again to proceed.");
        }
    }

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Settings" onBack={() => navigation.goBack()} />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <LabelText color={tokens.onBackground} style={styles.sectionLabel}>
                        General
                    </LabelText>
                    <SettingsRow
                        testID="settings-row-notifications"
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Chats, meetups, and updates"
                        onPress={() => navigation.navigate("Notifications")}
                    />
                    <SettingsRow
                        testID="settings-row-account-privacy"
                        icon="lock-closed-outline"
                        title="Account privacy"
                        subtitle="Visibility, messages, profile"
                        onPress={() => navigation.navigate("Account Privacy")}
                    />
                    <SettingsRow
                        testID="settings-row-recommendations"
                        icon="sparkles-outline"
                        title="Recommendations"
                        subtitle="Personalized meetup suggestions"
                        onPress={() => navigation.navigate("Recommendations")}
                    />
                </View>

                <Divider />

                <View style={styles.section}>
                    <LabelText color={tokens.onBackground} style={styles.sectionLabel}>
                        Support
                    </LabelText>
                    <SettingsRow
                        testID="settings-row-launch-tutorial"
                        icon="open-outline"
                        title="Launch tutorial"
                    />
                    <SettingsRow
                        testID="settings-row-privacy-policy"
                        icon="shield-checkmark-outline"
                        title="Privacy policy"
                        onPress={() => Linking.openURL("https://www.eat-together.org/privacy-policy")}
                    />
                    <SettingsRow
                        testID="settings-row-suggest-idea"
                        icon="flask-outline"
                        title="Suggest an idea"
                        onPress={() => navigation.navigate("Suggest Idea")}
                    />
                    <SettingsRow
                        testID="settings-row-report-bug"
                        icon="bug-outline"
                        title="Report a bug"
                        onPress={() => navigation.navigate("Report Bug")}
                    />
                </View>

                <Divider />

                <View style={styles.section}>
                    <LabelText color={tokens.onBackground} style={styles.sectionLabel}>
                        Account Settings
                    </LabelText>
                    <SettingsRow
                        testID="settings-row-logout"
                        title="Logout"
                        accessory="none"
                        onPress={() => setLogoutDialogVisible(true)}
                    />
                    <SettingsRow
                        testID="settings-row-delete-account"
                        title="Delete account"
                        accessory="none"
                        destructive
                        onPress={() => setDeleteDialogVisible(true)}
                    />
                </View>
            </ScrollView>

            <DialogOverlay visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
                <Dialog
                    type="Informative"
                    title="Log out"
                    icon={<Ionicons name="log-out-outline" size={40} color={tokens.onBackground} />}
                    primaryButtonText="Log out"
                    secondaryButtonText="Cancel"
                    onPrimaryPress={handleLogoutConfirm}
                    onSecondaryPress={() => setLogoutDialogVisible(false)}
                >
                    <SubBodyText color={tokens.onBackground} center>
                        Are you sure you want to log out?
                    </SubBodyText>
                </Dialog>
            </DialogOverlay>

            <DialogOverlay visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                <Dialog
                    type="Destructive with icon"
                    title="Delete account"
                    icon={<Ionicons name="trash" size={40} color={tokens.onBackground} />}
                    primaryButtonText="Delete account"
                    secondaryButtonText="Cancel"
                    onPrimaryPress={handleDeleteConfirm}
                    onSecondaryPress={() => setDeleteDialogVisible(false)}
                >
                    <SubBodyText color={tokens.onBackground} center>
                        Are you sure you want to delete your account? This action is not reversible and
                        you will not be able to recover your data after proceeding
                    </SubBodyText>
                </Dialog>
            </DialogOverlay>
        </Layout>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    content: {
        padding: 20,
        gap: 15,
    },
    section: {
        gap: 4,
    },
    sectionLabel: {
        marginBottom: 4,
    },
});
