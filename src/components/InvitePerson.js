import React, {useEffect} from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Checkbox from './Checkbox';

import TagsList from './TagsList';
import MediumText from "./MediumText";

const InvitePerson = props => {
    const [image, setImage] = React.useState("");
    const [bio, setBio] = React.useState("");

    useEffect(() => {
        if (props.person.hasImage) {
            setImage(props.person.image)
        }
        if (props.person.bio.length >= 35) {
            setBio(props.person.bio.substr(0, 35) + "...");
        } else {
            setBio(props.person.bio);
        }
    });

    return (
        <TouchableOpacity onPress={() => {
                props.navigation.navigate("FullProfile", {
                    person: props.person
                });
            }} style={styles.card}>
            <MediumText>{props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}</MediumText>

            <View style={styles.checkbox}>
                <Checkbox
                    checked={props.person.invited}
                    onPress={() => props.toggleInvite(props.person.id)}
                    color="black"
                />
            </View>

            <MediumText size={14}>{bio}</MediumText>
            <TagsList tags={props.person.selectedTags} left/>
        </TouchableOpacity>
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

    name: {
        marginRight: 20,
    },

    checkbox: {
        position: "absolute",
        right: 0,
        top: 10,
    }
})

export default InvitePerson;