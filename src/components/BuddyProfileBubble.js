import React from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import MediumText from "./MediumText";
import NormalText from "./NormalText";
import Tag from "./Tag";
import CustomButton from "./CustomButton";

const BuddyProfileBubble = (props) => {
    const navigation = useNavigation(); // Initialize navigation

    // Generates text for school tags in common with the user
    const getCommonSchoolTags = (tags) => {
        return tags.filter((tag) => tag.type === "school");
    };

    // Generates text for hobby and food tags in common with the user
    const getCommonHobbyFoodTags = (tags) => {
        return tags.filter((tag) => tag.type === "hobby" || tag.type === "food");
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={props.click}>
                <MediumText size={18}>
                    {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                </MediumText>
                <MediumText size={14}>🗯️ "{props.person.bio}"</MediumText>

                {props.person.inCommon.length > 0 && (
                    <View style={styles.common}>
                        {getCommonSchoolTags(props.person.inCommon).length !== 0 && (
                            <View style={styles.commonRow}>
                                <NormalText>🏫 You both are: </NormalText>
                                <ScrollView horizontal={true}>
                                    <View style={{ flexDirection: "row" }}>
                                        {getCommonSchoolTags(props.person.inCommon).map((tag) => (
                                            <Tag text={tag.tag} key={tag.tag} type={tag.type} />
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}
                        {getCommonHobbyFoodTags(props.person.inCommon).length !== 0 && (
                            <View style={styles.commonRow}>
                                <NormalText>🤩 You both enjoy: </NormalText>
                                <ScrollView horizontal={true}>
                                    <View style={{ flexDirection: "row" }}>
                                        {getCommonHobbyFoodTags(props.person.inCommon).map((tag) => (
                                            <Tag text={tag.tag} key={tag.tag} type={tag.type} />
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>

            {/* ✅ Fix: Pass props.person to SendBuddyRequest */}
            <CustomButton
                onPress={() => navigation.navigate("SendBuddyRequest", { user: props.person })}
                marginVertical={5}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MediumText style= {{color: "white"}}>Send a Buddy Request!</MediumText>
                    <Ionicons name="person-add" size={25} color="white" style={{marginLeft: 8}}/>
                </View>
                
            </CustomButton>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        width: Dimensions.get("screen").width - 40,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "white",
        shadowColor: "#000000",
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
    },

    common: {
        marginTop: 10,
    },

    commonRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },

    requestButton: {
        backgroundColor: "#4CAF50", // Green button
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
        alignSelf: "center",
    },

    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default BuddyProfileBubble;
