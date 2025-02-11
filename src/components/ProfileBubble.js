import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import MediumText from "./MediumText";
import NormalText from './NormalText';

import Tag from "./Tag";

const ProfileBubble = props => {
    // Generates text for school tags in common with the user
    const getCommonSchoolTags = tags => {
        return tags.filter(tag => tag.type === "school");
    }

    // Generates text for hobby and food tags in common with the user
    const getCommonHobbyFoodTags = tags => {
        return tags.filter(tag => tag.type === "hobby" || tag.type === "food");
    }

    return (
        <View style={[styles.card, {}]}>
            <TouchableOpacity onPress={props.click}>
                <MediumText size={18}>
                    {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                </MediumText>
                <MediumText size={14}>
                    🗯️ "{props.person.bio}"
                </MediumText>

                {props.person.inCommon.length > 0 && (<View style={styles.common}>
                    {getCommonSchoolTags(props.person.inCommon).length !== 0 && (<View style={styles.commonRow}>
                        <NormalText>This person is:</NormalText>
                        <ScrollView horizontal={true}>
                            <View onStartShouldSetResponder={() => true} style={{ flexDirection: "row" }}>
                                {getCommonSchoolTags(props.person.inCommon).map(tag =>
                                    <Tag text={tag.tag} key={tag.tag} type={tag.type}/>)}
                            </View>
                        </ScrollView>
                    </View>)}
                    {getCommonHobbyFoodTags(props.person.inCommon).length !== 0 && (<View style={styles.commonRow}>
                        <NormalText>Enjoyment:</NormalText>
                        <ScrollView horizontal={true}>
                            <View onStartShouldSetResponder={() => true} style={{ flexDirection: "row" }}>
                                {getCommonHobbyFoodTags(props.person.inCommon).map(tag =>
                                    <Tag text={tag.tag} key={tag.tag} type={tag.type}/>)}
                            </View>
                        </ScrollView>
                    </View>)}
                </View>)}
                <TouchableOpacity style={styles.greenButton}>
                    <MediumText style= {{color: "white"}}>Send a buddy Request!</MediumText>
                    <Ionicons name="person-add" size={20} color="white" />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: Dimensions.get('screen').width - 40,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "white",
        shadowColor: "#000000",
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 10
    },

    common: {
        marginTop: 10
    },

    commonRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap"
    },

    greenButton: {
        backgroundColor: "#5DB075",
        flexDirection: "row",
        justifyContent: "center",
        borderRadius: 8,
        marginTop: 15,
        padding: 10
    }
})

export default ProfileBubble;