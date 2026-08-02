import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import { Layout } from "../../rapi_ui_components";

import SmallAppBar from "../../components/SmallAppBar";
import SettingsRow from "../../components/SettingsRow";

export default function AccountPrivacy({ navigation }) {
    const [privateAccount, setPrivateAccount] = useState(true);
    const [allowMessageRequests, setAllowMessageRequests] = useState(true);
    const [hideGallery, setHideGallery] = useState(false);

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
                    onValueChange={setPrivateAccount}
                />
                <SettingsRow
                    testID="settings-row-allow-message-requests"
                    title="Allow message requests"
                    subtitle="Allow anyone in the app to request to message you even if they aren't connected with you"
                    accessory="switch"
                    value={allowMessageRequests}
                    onValueChange={setAllowMessageRequests}
                />
                <SettingsRow
                    testID="settings-row-hide-gallery"
                    title="Hide gallery"
                    subtitle="Only your connections will be able to view your profile image gallery"
                    accessory="switch"
                    value={hideGallery}
                    onValueChange={setHideGallery}
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
