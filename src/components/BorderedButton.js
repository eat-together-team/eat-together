import React from "react";
import { TouchableOpacity } from "react-native";
import MediumText from "./MediumText";

const BorderedButton = props => {
    console.log("BorderedButton fontSize:", props.fontSize)
    return (
        <TouchableOpacity style={[{
            backgroundColor: "white",
            borderColor: props.color ? props.color : "#5DB075",
            borderWidth: props.borderWidth ? props.borderWidth : 2,
            height: props.height ? props.height : "auto",
            borderRadius: 10,
            paddingHorizontal: props.paddingHorizontal !== undefined ? props.paddingHorizontal : 40,
            paddingVertical: props.paddingVertical !== undefined ? props.paddingVertical : (props.height ? 0 : 15),
            opacity: props.disabled ? 0.7 : 1,
            width: props.width ? props.width : "auto",
            marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 0,
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            elevation: 5
        }, props.style]} onPress={props.onPress} disabled={props.disabled}>
            <MediumText style={props.textStyle} color={props.color ?? "#5DB075"} center
                size={props.fontSize ?? 20} lineHeight={props.lineHeight ?? undefined} numberOfLines={1}>
                    {props.children}
            </MediumText>
        </TouchableOpacity>
    );
}

export default BorderedButton;