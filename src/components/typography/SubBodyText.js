import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';

const SubBodyText = props => {
    let [fontsLoaded] = useFonts({ Inter_400Regular });

    if (!fontsLoaded) {
        return (
            <Text style={[{
                fontSize: 12,
                fontFamily: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif',
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
            fontSize: 12,
            fontFamily: 'Inter_400Regular',
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

export default SubBodyText;
