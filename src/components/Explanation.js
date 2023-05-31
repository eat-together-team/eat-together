// A component that provides a brief explanation of a component/feature via a bubble that appears right beside it

import React from "react";
import { View, StyleSheet } from "react-native";

const Explanation = props => {
    return (
        <View style={styles.container}>
            <View style={styles.triangle}/>
            <View style={styles.bubble}>
                {props.children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        flexDirection: "row",
        left: "100%",
        zIndex: 100,
        alignItems: "center",
        justifyContent: "center",
    },

    triangle: {
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#AAAAAA', // Change the color as desired
        transform: [{ rotate: '270deg' }],
        left: 5
    },
    
    bubble: {
        paddingHorizontal: 5,
        borderRadius: 5,
        width: 150,
        height: 40,
        backgroundColor: "#AAAAAA",
        alignItems: "center",
        justifyContent: "center"
    }
});

export default Explanation;