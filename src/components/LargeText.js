import React from "react";
import { Platform, Text } from "react-native";
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';

const LargeText = props => {
    let [fontsLoaded] = useFonts({ Inter_700Bold });

    if (!fontsLoaded) {
        return (
            <Text style={{
                fontSize: props.size ? props.size : 30,
                fontFamily: Platform.OS === 'ios' ? 'AppleSDGothicNeo-Bold' : 'sans-serif-condensed',
                color: props.color ? props.color : "black",
                textAlign: props.center ? "center" : "auto",
                paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
                marginBottom: props.marginBottom ? props.marginBottom : 0
            }}
                numberOfLines={props.numberOfLines}
                ellipsizeMode={props.ellipsizeMode ? props.ellipsizeMode : 'tail'}
            >
                {props.children}
            </Text>
        );
    }

    return (
        <Text style={[{
            fontSize: props.size ? props.size : 30,
            fontFamily: 'Inter_700Bold',
            color: props.color ? props.color : "black",
            textAlign: props.center ? "center" : "auto",
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
            marginBottom: props.marginBottom ? props.marginBottom : 0
        }, props.style]}

            numberOfLines={props.numberOfLines}
            ellipsizeMode={props.ellipsizeMode ? props.ellipsizeMode : 'tail'}

        >
            {props.children}
        </Text>
    );
}

export default LargeText;