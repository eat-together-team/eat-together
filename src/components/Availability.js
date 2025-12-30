import React from "react";
import { View, TouchableOpacity } from "react-native";

import NormalText from "./NormalText";
import getTime from "../getTime";

const Availability = props => {
    return (
        <TouchableOpacity style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderRadius: 5,
            backgroundColor: "white",
            padding: 5,
            marginRight: 5,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 5,
            elevation: 5
        }} onPress={props.edit}>
            <NormalText size={10}>{getTime(props.time.startTime)} - {getTime(props.time.endTime)}</NormalText>
        </TouchableOpacity>
    );
}

export default Availability;