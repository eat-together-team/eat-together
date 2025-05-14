import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_300Light } from '@expo-google-fonts/inter';

const SmallText = props => {
    let [fontsLoaded] = useFonts({ Inter_300Light });

    if (!fontsLoaded) {
        return (
            <Text style={{
                fontSize: props.size ? props.size : 10,
                fontWeight: props.weight ? props.weight : "normal",
                fontFamily: Platform.os === 'ios' ? 'AppleSDGothicNeo-Light' : 'sans-serif-light',
                color: props.color ? props.color : "black",
                textAlign: props.center ? "center" : "auto",
                paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
                marginBottom: props.marginBottom ? props.marginBottom : 0,
            }}>
                {props.children}
            </Text>
        );
    }
    return (
        <Text style={{
            fontSize: props.size ? props.size : 10,
            fontWeight: props.weight ? props.weight : "normal",
            fontFamily: props.fontFamily ? props.fontFamily :'Inter_300Light',
            color: props.color ? props.color : "black",
            textAlign: props.center ? "center" : "auto",
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
            marginBottom: props.marginBottom ? props.marginBottom : 0
        }}>
            {props.children}
        </Text>
    );
}

export default SmallText;