import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../provider/Firebase';
import firebase from 'firebase/compat';
import { colorTokens } from '../theme/colorTokens';
import { useTheme } from '../rapi_ui_components';
import SmallAppBar from '../components/SmallAppBar';
import InformationCard from '../components/InformationCard';
import LargeButton from '../components/LargeButton';
import Dialog from '../components/Dialog';
import DialogOverlay from '../components/DialogOverlay';

const VerifyEmail = props => {
    const user = auth.currentUser;
    const uid = user.uid;
    const { theme } = useTheme();
    const colors = colorTokens[theme];
    const [userInfo, setUserInfo] = useState({});
    const [fontsLoaded] = useFonts({ Inter_700Bold, Inter_400Regular });
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const fontBold = fontsLoaded ? 'Inter_700Bold' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'sans-serif-bold';
    const fontRegular = fontsLoaded ? 'Inter_400Regular' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif';

    useEffect(() => {
        db.collection('Users').doc(uid).onSnapshot(doc => {
            setUserInfo(doc.data());
        });

        // Every 2 seconds, check if user has verified their email
        let interval = setInterval(() => {
            if (firebase.auth().currentUser) {
                firebase.auth().currentUser.reload().then(() => {
                    if (firebase.auth().currentUser.emailVerified) {
                        props.setCurrUser(firebase.auth().currentUser);
                        clearInterval(interval);
                    }
                });
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const resend = () => {
        firebase.auth().currentUser.sendEmailVerification();
    }

    const handleLogoutPress = () => {
        setShowLogoutDialog(true);
    }

    const handleConfirmLogout = () => {
        setShowLogoutDialog(false);
        auth.signOut();
    }

    const handleDeletePress = () => {
        setShowDeleteDialog(true);
    }

    const handleConfirmDelete = async () => {
        setShowDeleteDialog(false);
        try {
            await user.delete().then(() => {
                auth.signOut();
                alert("Account deleted successfully. Sorry to see you go :(");
            }).catch((error) => {
                auth.signOut().then(() => {
                    alert("You need to sign in again to proceed.");
                });
            });
        } catch (error) {
            alert("An error occurred while deleting your account.");
        }
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <SmallAppBar title="Welcome" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSection}>
                    <Text style={[styles.header, { fontFamily: fontBold, color: colors.onBackground }]}>
                        Please check your email inbox for a link to verify your account
                    </Text>
                    <Text style={[styles.subheader, { fontFamily: fontRegular, color: colors.onBackground }]}>
                        You must verify your account in order to proceed
                    </Text>

                    <InformationCard
                        type="Action"
                        text={`Verification was sent to ${user?.email || ''}`}
                        actionText="Resend verification email"
                        onAction={resend}
                    />
                </View>

                <View style={styles.bottomSection}>
                    <LargeButton
                        outlined
                        color={colors.primary}
                        onPress={handleLogoutPress}
                        leadingIcon={<Ionicons name="log-out-outline" size={16} color={colors.primary} />}
                    >
                        Log out
                    </LargeButton>
                    <LargeButton
                        outlined
                        color={colors.error}
                        onPress={handleDeletePress}
                        leadingIcon={<Ionicons name="trash-outline" size={16} color={colors.error} />}
                    >
                        Delete account
                    </LargeButton>
                </View>
            </ScrollView>

            <DialogOverlay visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
                <Dialog
                    type="Informative"
                    title="Log out"
                    icon={<Ionicons name="log-out-outline" size={40} color={colors.onBackground} />}
                    primaryButtonText="Log out"
                    secondaryButtonText="Cancel"
                    onPrimaryPress={handleConfirmLogout}
                    onSecondaryPress={() => setShowLogoutDialog(false)}
                >
                    <Text style={[styles.dialogContent, { color: colors.onBackground, fontFamily: fontsLoaded ? 'Inter_400Regular' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif' }]}>
                        Are you sure you want to log out?
                    </Text>
                </Dialog>
            </DialogOverlay>

            <DialogOverlay visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
                <Dialog
                    type="Destructive with icon"
                    title="Delete account"
                    icon={<Ionicons name="trash-outline" size={40} color={colors.onBackground} />}
                    primaryButtonText="Delete account"
                    secondaryButtonText="Cancel"
                    onPrimaryPress={handleConfirmDelete}
                    onSecondaryPress={() => setShowDeleteDialog(false)}
                >
                    <Text style={[styles.dialogContent, { color: colors.onBackground, fontFamily: fontsLoaded ? 'Inter_400Regular' : Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif' }]}>
                        Are you sure you want to delete your account? This action is not reversible and you will not be able to recover your data after proceeding
                    </Text>
                </Dialog>
            </DialogOverlay>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    topSection: {
        flex: 1,
        gap: 15,
    },
    header: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 20,
    },
    subheader: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 13,
        marginBottom: 15,
    },
    bottomSection: {
        gap: 15,
        paddingBottom: 10,
    },
    dialogContent: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default VerifyEmail;