import React from 'react';
import {Ionicons} from "@expo/vector-icons";

const InviteIcon = props => {

    //Choose which icon to display
    function whichIcon() {
        if(props.accepted === "accepted") {
            return ["checkmark-circle", "green"];
        } else if(props.accepted === "declined") {
            return ["close-circle", "red"];
        } else {
            return ["paper-plane", "gold"];
        }
    }

    //Return the actual icon
    return(
        <Ionicons name = {whichIcon()[0]} color = {whichIcon()[1]} size = {50}/>
    );
}

export default InviteIcon;