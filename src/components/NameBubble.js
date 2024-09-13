import React, { useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Image, Modal, Text } from 'react-native';
import PropTypes from 'prop-types';
import MediumText from "./MediumText";
import NormalText from './NormalText';
import CustomButton from './CustomButton';

// add in the onAccept and onDecline parameters once the backend for accept/decline is being set up
// like this: const NameBubble = ({ person, click, onAccept, onDecline }) => {
const NameBubble = ({ person, click}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const closeConfirmation = () => setShowConfirmation(false);

    return (
        <View style={styles.profile}>
            <Image
                style={styles.image}
                source={person.hasImage ? { uri: person.image } : require("../../assets/logo.png")}
            />
            <TouchableOpacity style={styles.contentContainer} onPress={click}>
                <MediumText size={16}>
                    {
                        (person.firstName + " " + person.lastName.substring(0, 1) + ".").length > 10 ?
                        (person.firstName + " " + person.lastName.substring(0, 1) + ".").substring(0, 10) + "..."
                        : person.firstName + " " + person.lastName.substring(0, 1) + "."
                    }
                </MediumText>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
                <CustomButton
                    onPress={() => {
                        setShowConfirmation(true);
                        // onAccept(person); // uncomment this once the backend is set up
                    }}
                    backgroundColor="#4CAF50"
                    width={70}
                    height={30}
                    borderRadius={5}
                    style={{ marginRight: 10 }}
                >
                    <NormalText size={12} style={{ color: "#FFFFFF" }}>Accept</NormalText>
                </CustomButton>
                <CustomButton
                    onPress={() => {
                        // onDecline(person); // uncomment this once the backend is set up
                        setShowConfirmation(false);
                    }}
                    backgroundColor="#D0D0D0"
                    width={70}
                    height={30}
                    borderRadius={5}
                >
                    <NormalText size={12} style={{ color: "#FFFFFF" }}>Decline</NormalText>
                </CustomButton>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showConfirmation}
                onRequestClose={closeConfirmation}
            >
                <View style={styles.centeredModal}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Yay! {person.firstName} is now your buddy!</Text>
                        <CustomButton
                            onPress={closeConfirmation}
                            backgroundColor="#2196F3"
                            paddingHorizontal={20}
                            paddingVertical={10}
                            borderRadius={20}
                        >
                            <Text style={{ color: "#FFFFFF" }}>Back</Text>
                        </CustomButton>
                    </View>
                </View>
            </Modal>
        </View>     
    );
};

const styles = StyleSheet.create({
    profile: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: Dimensions.get('window').width - 40,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 35,
        marginRight: 10,

    },
    contentContainer: {
        flexGrow: 1,
        paddingVertical: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    centeredModal: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    }
});

export default NameBubble;
