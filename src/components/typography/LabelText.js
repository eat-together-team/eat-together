import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_600SemiBold } from '@expo-google-fonts/inter';

const LabelText = props => {
    let [fontsLoaded] = useFonts({ Inter_600SemiBold });

    if (!fontsLoaded) {
        return (
            <Text style={[{
                fontSize: 11,
                fontFamily: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Medium' : 'sans-serif-medium',
                color: props.color ? props.color : "black",
                textAlign: props.center ? "center" : "auto",
            }, props.style]}
                numberOfLines={props.numberOfLines}
                ellipsizeMode={props.ellipsizeMode || 'tail'}
            >
                {props.children}
            </Text>
        );
    }

    return (
        <Text style={[{
            fontSize: 11,
            fontFamily: 'Inter_600SemiBold',
            color: props.color ? props.color : "black",
            textAlign: props.center ? "center" : "auto",
        }, props.style]}
            numberOfLines={props.numberOfLines}
            ellipsizeMode={props.ellipsizeMode || 'tail'}
        >
            {props.children}
        </Text>
    );
}

export default LabelText;
