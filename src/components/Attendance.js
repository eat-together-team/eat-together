import React from 'react';
import { TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import NormalText from './NormalText';
import { Foundation } from "@expo/vector-icons";

const Attendance = props => {
    return (
        // <TouchableOpacity style={[styles.outline, {
        //     borderColor: props.attending ? "#5DB075" : "grey"
        // }]} onPress={props.onPress}>
        //     <Image source={props.person.hasImage ? {uri: props.person.image}
        //         : require("../../assets/logo.png")} style={styles.image}/>
        <TouchableOpacity style={[styles.outline, {
            borderColor: props.attending ? "#5DB075" : "grey"
        }]} onPress={props.onPress} testID="attendance-button">
            <Image source={props.person.hasImage ? {uri: props.person.image}
                 : require("../../assets/logo.png")} style={styles.image} testID="person-image"/>

            <NormalText size={props.size ? props.size : 14} color="black">
                {props.person.firstName + " " + props.person.lastName}
            </NormalText>

            <Foundation name="check" size={24} color={props.attending ? "#5DB075" : "grey"}
                style={styles.checkMark}/>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    outline: {
        padding: 10,
//        may need to modify padding to make it consistent with icebreakers + "just yourself"
        width: Dimensions.get('screen').width - 60,
        marginVertical: 5,
        borderWidth: 3,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center"
    },
    image: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10
    },
    checkMark: {
        position: "absolute",
        right: 15,
        top: "45%"
    }
})

export default Attendance;