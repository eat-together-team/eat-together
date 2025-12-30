import React from 'react';
import {View, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import MediumText from './MediumText';

const HorizontalSwitch = props => {
    let style_left = null;
    let style_right = null;
    let action_left = null;
    let action_right = null;
    let left_color = "black";
    let right_color = "black";

    if (props.current == "left") {
        style_left = styles.current;
        style_right = styles.other;
        action_right = props.press;
        left_color = "#5db075";
        right_color = "black";
    } else {
        style_left = styles.other;
        style_right = styles.current;
        action_left = props.press;
        left_color = "black";
        right_color = "#5db075";
    }
    return (
        <View style={styles.container}>
            <TouchableOpacity style={style_left} onPress={action_left}>
                <MediumText center color={left_color} size={14}>{props.left}</MediumText>
            </TouchableOpacity>
            <TouchableOpacity style={style_right} onPress={action_right}>
                <MediumText center color={right_color} size={14}>{props.right}</MediumText>
                {props.pingRight && <View style={styles.unread}/>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingTop: 10,
        paddingHorizontal: 60,
        paddingBottom: 20,
        alignItems: "center",
        justifyContent: "center"
    },

    current: {
        height: 40,
        flex: 1,
        borderBottomColor: "#5db075",
        borderBottomWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10
    },

    other: {
        height: 40,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 10
    },

    buttonText: {
        textAlign: "center",
        color: "white"
    },

    unread: {
        width: 10,
        height: 10,
        borderRadius: 10,
        backgroundColor: "#5DB075",
        position: "absolute",
        top: 5,
        right: 5
    }
});

export default HorizontalSwitch;