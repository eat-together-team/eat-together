import React from 'react';
import { View } from 'react-native';
import NormalText from './NormalText';

const Icebreaker = props => {
    return (
        <View style={{marginTop: 10}}>
            <NormalText size={17} color="black">
                {props.number}. {props.icebreaker}
            </NormalText>
        </View>
        
    );
}

export default Icebreaker;