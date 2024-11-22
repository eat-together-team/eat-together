
import React from "react";
import TextInput from "./TextInput";
const Searchbar = props => {
    return (
        <TextInput
            iconLeft="search"
            iconLeftType="FontAwesome"
            iconFontSize={18}
            placeholder={props.placeholder} value={props.value} onChangeText={text => props.onChangeText(text)}
            width="100%" />
    );
}
export default Searchbar;
