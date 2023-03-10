import React from "react";
import { TouchableOpacity } from "react-native";
import NormalText from "./NormalText";

const Link = props => {
    return (
        <TouchableOpacity onPress={props.onPress} disabled={props.disabled} style={{
            width: props.width ? props.width : "auto",
            paddingHorizontal: props.paddingHorizontal ? props.paddingHorizontal : 0,
        }}>
            <NormalText color="#0398fc"
                size={props.size ? props.size : null} center>{props.children}</NormalText>
        </TouchableOpacity>
    );
}

export default Link;