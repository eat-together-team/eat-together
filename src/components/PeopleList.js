import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

import MediumText from "./MediumText";

import { Foundation } from "@expo/vector-icons";
import { storage } from "../provider/Firebase";

const PeopleList = props => {
    const [image, setImage] = useState("https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png");
    useEffect(() => {
        if (props.person.hasImage) {
            storage.ref("profilePictures/" + props.person.id).getDownloadURL().then(uri => {
                setImage(uri);
            });
        }
    }, []);
    return (
        <View style={styles.outline}>
            <TouchableOpacity onPress={props.click}>
                <View style={[styles.head, {
                    backgroundColor: props.color,
                    width: props.width ? props.width : Dimensions.get('screen').width - 40
                }]}>
                    <Image style={styles.image} source={{uri: image}}/>
                    <MediumText>
                        {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                    </MediumText>
                </View>

                {props.canEdit && <TouchableOpacity style={[styles.checkBox, {
                    borderColor: props.attending ? "#5DB075" : "grey"
                }]} onPress={props.check}>
                    {props.attending && <Foundation name="check" size={30} color="#5DB075"/>}
                </TouchableOpacity>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    outline: {
        marginVertical: 10
    },
    head: {
        height: 80,
        backgroundColor: "grey",
        borderRadius: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 90,
        borderColor: "white",
        borderWidth: 2,
        marginLeft: 15,
        marginRight: 10
    },
    name: {
        marginRight: 20,
    },
    checkBox: {
        position: "absolute",
        right: 15,
        top: "25%",
        borderWidth: 4,
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    }
})

export default PeopleList;