import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const Header2Text = props => {
    let [fontsLoaded] = useFonts({ Inter_700Bold });

    if (!fontsLoaded) {
        return (
            <Text style={[{
                fontSize: 20,
                fontFamily: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'sans-serif-condensed',
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
            fontSize: 20,
            fontFamily: 'Inter_700Bold',
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

export default Header2Text;
