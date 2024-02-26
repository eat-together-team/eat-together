import React from 'react';
import { View, StyleSheet } from 'react-native';
import { commonStyles } from '../../utils/Styles';
import NormalText from './NormalText';

const Icebreaker = props => {
    return (
        <View style={styles.container}>
            <NormalText size={17} color="black">
                {props.number}. {props.icebreaker}
            </NormalText>
        </View>
        
    );
}

export default Icebreaker;
const styles = StyleSheet.create({
    container: {
        ...commonStyles.outline,
        marginTop: 10,
        padding: 0,
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        backgroundColor: 'transparent'
    }
});