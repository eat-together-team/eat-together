import React from "react";
import { TouchableOpacity } from "react-native";
import MediumText from "./MediumText";
import { Ionicons } from '@expo/vector-icons';

const SmallButton = props => {
    return (
        <TouchableOpacity style={{
            backgroundColor: props.backgroundColor ? props.backgroundColor : "#5DB075",
            borderRadius: 7, // Updated from 10 to 7px
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 20, // Adjusted
            paddingVertical: props.paddingVertical ? props.paddingVertical : 5,  // Adjusted
            opacity: props.disabled ? 0.7 : 1,
            width: props.width ? props.width : 100, // Updated to 100px
            height: props.height ? props.height : 32, // Updated to 32px
            marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 0,
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 3,
            },
            shadowOpacity: 0.27,
            shadowRadius: 4.65,
            zIndex: props.zIndex ? props.zIndex : 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        }} onPress={props.onPress} disabled={props.disabled}>
            {props.icon && props.icon}
            <MediumText color={props.color ? props.color : "white"} center
                size={props.fontSize ? props.fontSize : 12}> {/* Reduced font size */}
                    {props.icon && " "}{props.children}
            </MediumText>
        </TouchableOpacity>
    );
}

export default SmallButton;
