import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import MediumText from "./MediumText";
import NormalText from './NormalText';
import Button from './Button';

import Tag from "./Tag";
import LargeText from './LargeText';
import SmallText from './SmallText';

const RequestBubble = props => {
    /*// Generates text for school tags in common with the user
    const getCommonSchoolTags = tags => {
        return tags.filter(tag => tag.type === "school");
    }

    // Generates text for hobby and food tags in common with the user
    const getCommonHobbyFoodTags = tags => {
        return tags.filter(tag => tag.type === "hobby" || tag.type === "food");
    }

    console.log(props.person.image);*/

    //const user = auth.currentUser;
    //const name = user.name;

    return (
        <View style={[styles.card, {}]}>
            <NormalText style={[styles.message, {}]}>
              “Hello, my name is Name X. I would love for you to become my buddy!”
            </NormalText>
            <Button
            marginHorizontal={10}
            paddingVertical={10}
            width={Dimensions.get('screen').width - 40}
            height={55}
            paddingHorizontal={20}
            fontSize={14}
            //onPress={}
          >
            Send message
          </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        // display: flex,
        //paddingVertical: 10,
        paddingHorizontal: 15,
        paddingTop: 10,
        width: Dimensions.get('screen').width - 40,
        height: 200,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "#DEE9DB",
        alignItems: "center",
        justifyContent: 'space-between'
    },

    message: {
        textColor: "grey"
    },
})

export default RequestBubble;