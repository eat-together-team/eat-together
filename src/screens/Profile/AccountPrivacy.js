import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Layout } from "../../rapi_ui_components";
import { db, auth } from "../../provider/Firebase";

import SmallAppBar from "../../components/SmallAppBar";
import SettingsRow from "../../components/SettingsRow";

export default function AccountPrivacy({ navigation }) {
    const user = auth.currentUser;
    // Defaults match today's effective behavior for anyone who hasn't set
    // these yet: profiles are discoverable, message requests are allowed,
    // and the gallery is visible to everyone.
    const [privateAccount, setPrivateAccount] = useState(false);
    const [allowMessageRequests, setAllowMessageRequests] = useState(true);
    const [hideGallery, setHideGallery] = useState(false);

    useEffect(() => {
        db.collection("Users").doc(user.uid).get().then((doc) => {
            const settings = doc.data()?.settings || {};
            setPrivateAccount(settings.privateAccount ?? false);
            setAllowMessageRequests(settings.allowMessageRequests ?? true);
            setHideGallery(settings.hideGallery ?? false);
        });
    }, []);

    const updateSetting = (field, setter) => (value) => {
        setter(value);
        db.collection("Users").doc(user.uid).update({
            [`settings.${field}`]: value,
        });
    };

    return (
        <Layout style={styles.screen}>
            <SmallAppBar title="Account privacy" onBack={() => navigation.goBack()} />
            <View style={styles.content}>
                <SettingsRow
                    testID="settings-row-private-account"
                    title="Private account"
                    subtitle="Prevent your profile from being discovered in search and recommendations"
                    accessory="switch"
                    value={privateAccount}
                    onValueChange={updateSetting("privateAccount", setPrivateAccount)}
                />
                <SettingsRow
                    testID="settings-row-allow-message-requests"
                    title="Allow message requests"
                    subtitle="Allow anyone in the app to request to message you even if they aren't connected with you"
                    accessory="switch"
                    value={allowMessageRequests}
                    onValueChange={updateSetting("allowMessageRequests", setAllowMessageRequests)}
                />
                <SettingsRow
                    testID="settings-row-hide-gallery"
                    title="Hide gallery"
                    subtitle="Only your connections will be able to view your profile image gallery"
                    accessory="switch"
                    value={hideGallery}
                    onValueChange={updateSetting("hideGallery", setHideGallery)}
                />
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
        gap: 4,
    },
});
