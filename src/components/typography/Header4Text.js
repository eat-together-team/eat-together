import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter';

const Header4Text = props => {
    let [fontsLoaded] = useFonts({ Inter_500Medium });

    if (!fontsLoaded) {
        return (
            <Text style={[{
                fontSize: 13,
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
            fontSize: 13,
            fontFamily: 'Inter_500Medium',
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

export default Header4Text;
