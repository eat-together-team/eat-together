import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';

import MediumText from "./MediumText";
import { Foundation } from "@expo/vector-icons";
import { commonStyles } from '../../utils/Styles';
import { useImageLoader } from '../../utils/Helpers';

const PeopleList = props => {
    const image = useImageLoader("https://static.wixstatic.com/media/d58e38_29c96d2ee659418489aec2315803f5f8~mv2.png", props.person.hasImage ? "profilePictures/" + props.person.id : null);
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
    outline: commonStyles.outline,
    head: {
        ...commonStyles.outline,
        padding: 0,
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: props.color,
        width: props.width ? props.width : Dimensions.get('screen').width - 40
    },
    image: commonStyles.image,
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