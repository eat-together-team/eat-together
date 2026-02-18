import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MediumText from './MediumText';

const Tag = props => {
    return (
        <View style={props.type ? [styles.tag, {
            backgroundColor: props.type === "school" ? "#FFFCE5"
                : props.type === "hobby" ? "#E5F7FF"
                : props.type === "food" ? "#FDE5FF"
                : "#E5FFF2"
        }] : styles.tag}>
            <MediumText size={12} color={
                props.type === "school" ? "#CC9300"
                : props.type === "hobby" ? "#05097A"
                : props.type === "food" ? "#460072"
                : "white"
            }>{props.text}</MediumText>
            {props.remove && 
                <TouchableOpacity onPress={props.remove} style={styles.close}>
                    <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    tag: {
        justifyContent: 'center',
        flex: 0,
        backgroundColor: '#666666',
        flexDirection: 'row',
        alignItems: 'center',
        margin: 2,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 15,
        overflow: 'hidden',
        // iOS shadow only; Android uses elevation (set to 0 to avoid black line under tags)
        ...(Platform.OS === 'ios' && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 2,
        }),
        ...(Platform.OS === 'android' && { elevation: 0 }),
    },

    close: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    }
})

export default Tag;