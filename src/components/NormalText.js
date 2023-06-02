import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_400Regular } from '@expo-google-fonts/inter';

const NormalText = props => {
    let [fontsLoaded] = useFonts({ Inter_400Regular });

    if (!fontsLoaded) {
        return (
            <Text style={{
                fontSize: props.size ? props.size : 14,
                fontWeight: props.weight ? props.weight : "normal",
                fontFamily: Platform.os === 'ios' ? 'AppleSDGothicNeo-Regular' : 'sans-serif',
                color: props.color ? props.color : "black",
                textAlign: props.center ? "center" : "auto",
                paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
                marginBottom: props.marginBottom ? props.marginBottom : 0,
                marginTop: props.marginTop ? props.marginTop : 0,
                ...props.style
            }}>
                {props.children}
            </Text>
        );
    }
    return (
        <Text style={{
            fontSize: props.size ? props.size : 14,
            fontWeight: props.weight ? props.weight : "normal",
            fontFamily: 'Inter_400Regular',
            color: props.color ? props.color : "black",
            textAlign: props.center ? "center" : "auto",
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
            marginBottom: props.marginBottom ? props.marginBottom : 0,
            marginTop: props.marginTop ? props.marginTop : 0,
            ...props.style
        }}>
            {props.children}
        </Text>
    );
}

export default NormalText;
