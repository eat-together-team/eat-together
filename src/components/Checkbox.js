import React from "react";
import { TouchableOpacity } from "react-native";
import { Foundation } from '@expo/vector-icons';

const Checkbox = props => {
    return (
        <TouchableOpacity style={{
            width: 35,
            height: 35,
            borderRadius: 10,
            borderColor: '#5DB075',
            borderWidth: 4,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15
        }} onPress={props.onPress}>
            {props.checked && <Foundation name="check" size={25} color="#5DB075" />}
        </TouchableOpacity>
    );
}

export default Checkbox;