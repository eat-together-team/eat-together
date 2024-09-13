// For Recommended buddy system, confirmation button once clicked "Accept" for a buddy.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomButton from './CustomButton'; // Ensure this is imported correctly

const ConfirmationButton = ({ route, navigation }) => {
    const { personName } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Yay! {personName} is now your buddy!</Text>
            <CustomButton
                onPress={() => navigation.goBack()}
                backgroundColor="#2196F3"
                paddingHorizontal={20}
                paddingVertical={10}
                borderRadius={20}>
                <Text style={styles.buttonText}>Back</Text>
            </CustomButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

export default ConfirmationButton;
