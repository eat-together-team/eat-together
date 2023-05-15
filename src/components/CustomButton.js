import React from "react";
import { TouchableOpacity } from "react-native";

const CustomButton = props => {
    return (
        <TouchableOpacity style={{
            backgroundColor: props.backgroundColor ? props.backgroundColor : "#5DB075",
            borderRadius: 10,
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 5,
            paddingVertical: props.paddingVertical ? props.paddingVertical : 5,
            opacity: props.disabled ? 0.7 : 1,
            width: props.width ? props.width : "auto",
            height: props.height ? props.height : "auto",
            marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 0,
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            alignItems: props.alignItems ? props.alignItems : "center",
            justifyContent: props.justifyContent ? props.justifyContent : "center",
            elevation: 5
        }} onPress={props.onPress} disabled={props.disabled || props.clickDisabled}>
            {props.children}
        </TouchableOpacity>
    );
}

export default CustomButton;