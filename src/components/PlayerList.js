import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';

import MediumText from "./MediumText";

import { storage } from "../provider/Firebase";

const PlayerList = props => {
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
                <View style={styles.head}>
                    <Image style={styles.image} source={{uri: image}}/>
                    <MediumText>
                        {props.person.firstName + " " + props.person.lastName.substring(0, 1) + "."}
                    </MediumText>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    outline: {
        marginVertical: 5,
        borderRadius: 15,
        paddingVertical: 5,
        elevation: 10
    },
    head: {
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    image: {
        width: 30,
        height: 30,
        borderRadius: 50,
        marginLeft: 15,
        marginRight: 10
    }
})

export default PlayerList;