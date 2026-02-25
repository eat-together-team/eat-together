import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

import MediumText from "./MediumText";
import SmallText from "./SmallText";

import { Foundation, Ionicons } from "@expo/vector-icons";
import { storage } from "../provider/Firebase";
import NormalText from './NormalText';

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
        <View style={[styles.outline, { backgroundColor: props.color }]}>
            <TouchableOpacity onPress={props.click}>
                <View style={[styles.head, {
                    backgroundColor: props.color,
                    width: props.width ? props.width : Dimensions.get('screen').width - 40
                }]}>
                    <Image style={styles.image} source={{uri: image}}/>
                    <View style={styles.nameContainer}>
                        <NormalText weight="bold">
                            {props.person.firstName + " " + props.person.lastName}
                        </NormalText>
                        {props.person.friendIDs && (
                            <NormalText style={styles.connectionCount}>
                                {props.person.friendIDs.length} {props.person.friendIDs.length === 1 ? 'connection' : 'connections'}
                            </NormalText>
                        )}
                    </View>
                </View>

                {props.canEdit && <TouchableOpacity style={[styles.checkBox, {
                    borderColor: props.attending ? "#5DB075" : "grey"
                }]} onPress={props.check}>
                    {props.attending && <Foundation name="check" size={30} color="#5DB075"/>}
                </TouchableOpacity>}

                {props.onDelete && <TouchableOpacity 
                    style={styles.deleteIcon} 
                    onPress={props.onDelete}>
                    <Ionicons name="trash-outline" size={24} color="#797979"/>
                </TouchableOpacity>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    outline: {
        marginVertical: 5,
        borderRadius: 15,
        paddingVertical: 10,
        elevation: 10
    },
    head: {
        flexDirection: "row",
        alignItems: "center"
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginLeft: 15,
        marginRight: 10
    },
    nameContainer: {
        flexDirection: "column",
        justifyContent: "center",
    },
    connectionCount: {
        marginTop: 4,
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
    },
    deleteIcon: {
        position: "absolute",
        right: 15,
        top: "25%",
        paddingRight: 5,
    }
})

export default PeopleList;