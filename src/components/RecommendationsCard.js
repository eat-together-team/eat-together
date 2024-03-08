import React from "react";
import {
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    View
} from "react-native";
import { Section, SectionContent, SectionImage } from "react-native-rapi-ui";
import MediumText from "./MediumText";
import SmallText from "./SmallText";

import getDate from "../getDate";
import getTime from "../getTime";

const RecommendationsCard = (props) => {
    return (
        <Section style={styles.card} borderRadius={30}>
            <TouchableOpacity onPress={props.click} disabled={props.disabled}>
                <SectionImage
                    height={100}
                    source={
                        props.event.hasImage
                            ? { uri: props.event.image }
                            : {
                                uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=60&raw_url=true&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400",
                            }
                    }
                />
                
                <View style={styles.moreInfo} borderRadius={30}>
                    <MediumText center color="white" size={14}>Recommended!</MediumText>
                </View>

                <SectionContent style={{alignItems: "center", paddingTop: 10, paddingHorizontal: 10}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Image style={{width: 50, height: 50}} source={require("../../assets/sparkles.gif")}/>
                        <MediumText center>{props.event.name.length > 20 ? props.event.name.substring(0, 20).concat("...") : props.event.name}</MediumText>
                    </View>
                    <SmallText size={12} center>
                        {props.event.location} |{" "}
                        {props.event.startDate ? getDate(props.event.startDate.toDate()) : getDate(props.event.date.toDate())} |{" "}
                        {props.event.startDate ? getTime(props.event.startDate.toDate()) : getTime(props.event.date.toDate())}
                        {props.event.endDate && " - ".concat(getTime(props.event.endDate.toDate()))}
                    </SmallText>
                </SectionContent>
            </TouchableOpacity>
        </Section>
    );
};

const styles = StyleSheet.create({
    card: {
        shadowColor: "#000000",
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 20,
        width: Dimensions.get("window").width - 50,
        marginBottom: 10,
    },

    image: {
        width: Dimensions.get("window").width - 50,
        height: 150,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },

    moreInfo: {
        position: "absolute",
        top: 10,
        right: 10,
        padding: 10,
        backgroundColor: "#5DB075"
    }
});

export default RecommendationsCard;
