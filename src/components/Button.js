import React from "react";
import { TouchableOpacity } from "react-native";
import MediumText from "./MediumText";
import { Ionicons } from '@expo/vector-icons';


const Button = props => {
    console.log("Button fontSize:", props.fontSize)
    return (
        <TouchableOpacity style={{
            backgroundColor: props.backgroundColor ? props.backgroundColor : "#5DB075",
            borderRadius: 10,
            borderWidth: props.borderWidth ?? 0,
            borderColor: props.borderColor ?? "transparent",
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 40,
            paddingVertical: props.paddingVertical ? props.paddingVertical : 15,
            height: props.height,  // use height directly if passed
            opacity: props.disabled ? 0.7 : 1,
            width: props.width ? props.width : "auto",
            marginHorizontal: props.marginHorizontal ? props.marginHorizontal : 0,
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            elevation: props.noShadow ? 0 : 10,
            shadowColor: props.noShadow ? "transparent" : "#000",
            shadowOffset: props.noShadow ? undefined : { width: 0, height: 3 },
            shadowOpacity: props.noShadow ? 0 : 0.27,
            shadowRadius: props.noShadow ? 0 : 4.65,
            zIndex: props.zIndex ? props.zIndex : 10,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: props.marginBottom ? props.marginBottom :
                (props.marginVertical ? props.marginVertical : 0),
        }} onPress={props.onPress} disabled={props.disabled}>
            {props.icon && props.icon}
            <MediumText color={props.color ? props.color : "white"} center
                size={props.fontSize ? props.fontSize : 20} lineHeight={props.lineHeight ? props.lineHeight : undefined} numberOfLines={1}>
                    {props.icon && " "}{props.children}
            </MediumText>
        </TouchableOpacity>

    );
}

export default Button;