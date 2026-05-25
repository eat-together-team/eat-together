import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_800ExtraBold } from '@expo-google-fonts/inter';

const Header1Text = props => {
    let [fontsLoaded] = useFonts({ Inter_800ExtraBold });

    if (!fontsLoaded) {
        return (
            <Text style={[{
                fontSize: 34,
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
            fontSize: 34,
            fontFamily: 'Inter_800ExtraBold',
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

export default Header1Text;
