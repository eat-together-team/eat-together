import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MediumText from './MediumText';
import NormalText from './NormalText';

const Tag = props => {
    const typeBg = props.type === "school" ? "#FFFCE5"
        : props.type === "hobby" ? "#E5F7FF"
        : props.type === "food" ? "#FDE5FF"
        : props.type ? "#E5FFF2" : undefined;
    const tagStyle = [
        styles.tag,
        typeBg && { backgroundColor: typeBg },
        props.backgroundColor && { backgroundColor: props.backgroundColor },
        props.justifySpaceBetween && { justifyContent: 'space-between' },
        props.style
    ];
    const textColor = props.type === "school" ? "#CC9300"
        : props.type === "hobby" ? "#05097A"
        : props.type === "food" ? "#460072"
        : props.color ?? "white";
    const TextComponent = props.plain ? NormalText : MediumText;
    return (
        <View style={tagStyle}>
            <View style={[styles.textWrap, props.plain && styles.textWrapLeft]}>
                <TextComponent size={12} color={textColor} style={props.plain ? { textAlign: 'left' } : undefined}>{props.text}</TextComponent>
            </View>
            {props.remove && 
                <TouchableOpacity onPress={props.remove} style={styles.close}>
                    <Ionicons name="close" size={16} color={props.closeIconColor ?? "white"} />
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
        paddingVertical: 10,
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
    textWrap: {
        flex: 1,
    },
    textWrapLeft: {
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    close: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10
    }
})

export default Tag;