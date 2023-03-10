import React from "react";
import {
  View,
  StyleSheet,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "./CustomButton";
import NormalText from "./NormalText";
import SmallText from "./SmallText";
import MediumText from "./MediumText";

function whichIcon(type) {
    switch (type) {
        case "invite":
        default:
            return "mail-outline";
        case "private event":
        case "public event":
            return "fast-food-outline";
        case "user profile":
            return "person-add-outline";
        case "recommendation":
            return "star-outline";
    }
}

const Notification = (props) => {
    return (
        <View style={styles.outline}>
            <View style={styles.head}>
                <Ionicons name={whichIcon(props.notif.type)} size={50} style={styles.icon} color="black" />
                <View style={styles.textContainer}>
                    <MediumText size={14}>{props.notif.title}</MediumText>
                    <NormalText size={12}>{props.notif.body}</NormalText>
                    {props.showButton && <View style={styles.buttons}>
                        <CustomButton marginHorizontal={10} width={80} onPress={props.onPress}>
                            <SmallText center color="white">Details</SmallText>
                       </CustomButton>
                    </View>}
                </View>
            </View>
        </View>
    );
};
    
const styles = StyleSheet.create({
    outline: {
        alignItems: "center",
    },
    head: {
        width: Dimensions.get('window').width * 0.95,
        backgroundColor: "white",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 30,
        paddingVertical: 10
    },
    textContainer: {
        flexDirection: "column",
        width: 250
    },
    icon: {
        width: 50,
        height: 50,
        marginRight: 20
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    response: {

        flexDirection: "row"
    },
});

export default Notification;
