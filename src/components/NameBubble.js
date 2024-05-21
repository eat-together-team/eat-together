// Modified component for the accept/decline bubble used in the Recommended Buddy System's Incoming/Outoing Requests
import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MediumText from "./MediumText";
import NormalText from './NormalText';
import CustomButton from './CustomButton';
import Tag from "./Tag";

const NameBubble = props => {
    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.contentContainer} onPress={props.click}>
                <MediumText size={18}>
                    {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                </MediumText>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
                <CustomButton
                    onPress={() => console.log("Accepted")}
                    backgroundColor="#4CAF50"
                    width={70}
                    height={30}
                    borderRadius={5}
                    style={{ marginRight: 10 }}  // Add right margin to only the Accept button
                >
                    <NormalText size={12} style={{ color: "#FFFFFF" }}>Accept</NormalText>
                </CustomButton>
                <CustomButton
                    onPress={() => console.log("Declined")}
                    backgroundColor="#D0D0D0"
                    width={70}
                    height={30}
                    borderRadius={5}>
                    <NormalText size={12} style={{ color: "#FFFFFF" }}>Decline</NormalText>
                </CustomButton>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: Dimensions.get('screen').width - 40,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
        flexDirection: 'column',
        alignItems: 'center',
        overflow: "hidden",
    },
    contentContainer: {
        width: '100%',
        paddingVertical: 10,
    },
    detailSection: {
        alignItems: 'flex-start',
        width: '100%',
    },
    tags: {
        flexDirection: 'row',
        marginTop: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        width: '100%',
        paddingHorizontal: 20, 
    }
});

export default NameBubble;
