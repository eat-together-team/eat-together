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
        marginVertical: 5,
        shadowColor: "#000000",
        backgroundColor: "white",
        borderRadius: 15,
        paddingVertical: 10,
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 10
    },
    head: {
        flexDirection: "row",
        alignItems: "center",
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginLeft: 15,
        marginRight: 10
    },
    name: {
        marginRight: 20,
    },
    checkBox: {
        position: "absolute",
        right: 15,
        top: "10%",
        borderWidth: 4,
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center"
    }
})

export default PeopleList;