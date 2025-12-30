import React from "react";
import { TouchableOpacity } from "react-native";
import MediumText from "./MediumText";
import { Ionicons } from '@expo/vector-icons';


const Button = props => {
    return (
        <TouchableOpacity style={[
            {
                backgroundColor: props.backgroundColor ?? "#5DB075",
                borderRadius: 10,
                paddingHorizontal: props.paddingHorizontal ?? 40,
                paddingVertical: props.paddingVertical ?? 15,
                opacity: props.disabled ? 0.7 : 1,
                width: props.width ?? "auto",
                marginHorizontal: props.marginHorizontal ?? 0,
                marginVertical: props.marginVertical ?? 0,
                elevation: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
                zIndex: props.zIndex ?? 10,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
            },
            props.style // allow using different style
        ]} onPress={props.onPress} disabled={props.disabled}>
            {props.icon && props.icon}
            <MediumText color={props.color ? props.color : "white"} center
                size={props.fontSize ? props.fontSize : 20}>
                    {props.icon && " "}{props.children}
            </MediumText>
        </TouchableOpacity>

    );
}

export default Button;