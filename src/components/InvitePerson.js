import React, {useEffect} from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import {CheckBox} from 'react-native-rapi-ui';

import TagsList from './TagsList';
import MediumText from "./MediumText";

const InvitePerson = props => {
    const [image, setImage] = React.useState("");
    const [bio, setBio] = React.useState("");

    useEffect(() => {
        if (props.person.hasImage) {
            setImage(props.person.image)
        }
        if (props.person.bio.length >= 30) {
            setBio(props.person.bio.substr(0, 27) + "...");
        } else {
            setBio(props.person.bio);
        }
    });

    return (
        <View style={styles.outline}>
            <View style={styles.head}>
                <TouchableOpacity onPress={() => {
                    props.navigation.navigate("FullProfile", {
                        person: props.person
                    });
                }}>
                    <View style={styles.headleft}>
                        <Image style={styles.image} source={require("../../assets/logo.png")}/>
                        <MediumText>{props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}</MediumText>
                    </View>
                </TouchableOpacity>
                <View style={styles.checkbox}>
                    <CheckBox value={props.person.invited} onValueChange={() => props.toggleInvite(props.person.id)} />
                </View>
            </View>
            <View style={[styles.body, {backgroundColor: props.person.color}]}>
                <MediumText>{bio}</MediumText>
                <TagsList tags={props.person.selectedTags} left/>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outline: {
        width: Dimensions.get("window").width - 20,
        padding: 10
    },
    head: {
        height: 80,
        backgroundColor: "grey",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    body: {
        backgroundColor: "red",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 20,
    },
    headleft: {
        flexDirection: "row",
        alignItems: "center"
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 90,
        borderColor: "white",
        borderWidth: 2,
        marginLeft: 25,
        marginRight: 20
    },
    name: {
        marginRight: 20,
    },
    checkbox: {
       marginRight: 25
    }
})

export default InvitePerson;