import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
import NormalText from './NormalText';
import { Foundation } from "@expo/vector-icons";
import { commonStyles } from '../../utils/Styles';

const Attendance = props => {
    return (
        <TouchableOpacity style={[styles.outline, {
            borderColor: props.attending ? "#5DB075" : "grey"
        }]} onPress={props.onPress}>
            <Image source={props.person.hasImage ? {uri: props.person.image}
                : require("../../assets/logo.png")} style={styles.image}/>

            <NormalText size={props.size ? props.size : 14} color="black">
                {props.person.firstName + " " + props.person.lastName}
            </NormalText>

            <Foundation name="check" size={24} color={props.attending ? "#5DB075" : "grey"}
                style={styles.checkMark}/>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    outline: {
        ...commonStyles.outline,
        width: Dimensions.get('screen').width - 60,
        borderRadius: 10,
        borderColor: props.attending ? "#5DB075" : "grey"
    },
    image: commonStyles.image,
    checkMark: commonStyles.checkMark
});

export default Attendance;