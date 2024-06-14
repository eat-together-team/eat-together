import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import MediumText from "./MediumText";
import NormalText from './NormalText';

import Tag from "./Tag";
import LargeText from './LargeText';

const ProfileBubble = props => {
    // Generates text for school tags in common with the user
    const getCommonSchoolTags = tags => {
        return tags.filter(tag => tag.type === "school");
    }

    // Generates text for hobby and food tags in common with the user
    const getCommonHobbyFoodTags = tags => {
        return tags.filter(tag => tag.type === "hobby" || tag.type === "food");
    }

    console.log(props.person.image);

    return (
        <View style={[styles.card, {}]}>
            <TouchableOpacity onPress={props.click}>
            <View style={styles.profile}>
                <Image
                style={styles.image}
                source={
                    props.person.hasImage
                    ? { uri: props.person.image }
                    : require("../../assets/logo.png")
                }
                />
                <LargeText size={30}>
                    {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                </LargeText>
            </View>

                <MediumText size={14}>
                    🗯️ "{props.person.bio}"
                </MediumText>

                {props.person.inCommon.length > 0 && (<View style={styles.common}>
                    {getCommonSchoolTags(props.person.inCommon).length !== 0 && (<View style={styles.commonRow}>
                        <NormalText>🏫 You both are: </NormalText>
                        <ScrollView horizontal={true}>
                            <View onStartShouldSetResponder={() => true} style={{ flexDirection: "row" }}>
                                {getCommonSchoolTags(props.person.inCommon).map(tag =>
                                    <Tag text={tag.tag} key={tag.tag} type={tag.type}/>)}
                            </View>
                        </ScrollView>
                    </View>)}
                    {getCommonHobbyFoodTags(props.person.inCommon).length !== 0 && (<View style={styles.commonRow}>
                        <NormalText>🤩 You both enjoy: </NormalText>
                        <ScrollView horizontal={true}>
                            <View onStartShouldSetResponder={() => true} style={{ flexDirection: "row" }}>
                                {getCommonHobbyFoodTags(props.person.inCommon).map(tag =>
                                    <Tag text={tag.tag} key={tag.tag} type={tag.type}/>)}
                            </View>
                        </ScrollView>
                    </View>)}
                </View>)}

            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        // display: flex,
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

    image: {
        width: 50,
        height: 50,
        borderRadius:50,
        marginRight: 20,
        paddingBottom: 30
    },

    profile: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 20
    }
})

export default ProfileBubble;