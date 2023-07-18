import React from "react";
import { TouchableOpacity, Image, Text, Platform } from "react-native";
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';

const GoogleButton = props => {
    let [fontsLoaded] = useFonts({ Roboto_700Bold });

    return (
        <TouchableOpacity style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 10,
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 10,
            paddingVertical: props.paddingVertical ? props.paddingVertical : 10,
            opacity: props.disabled ? 0.7 : 1,
            width: props.width ? props.width : "auto",
            marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 0,
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            elevation: 10, // modified
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,
            zIndex: 10,
        }} onPress={props.onPress} disabled={props.disabled}>
            <Image source={require("../../assets/google-logo.png")}/>
            <Text style={{
                fontSize: 16,
                fontFamily: fontsLoaded ? "Roboto_700Bold" : Platform.os === 'ios' ? 'AppleSDGothicNeo-Medium' : 'sans-serif-medium',
                color: "grey",
                textAlign: "center",
                marginLeft: 10
            }}>{props.children}</Text>
        </TouchableOpacity>
    );
}

export default GoogleButton;