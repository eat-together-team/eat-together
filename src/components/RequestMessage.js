import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import Button from './Button';

const RequestBubble = props => {
    const [text, onChangeText] = React.useState('Hello, my name is Name X. I would love for you to become my buddy!');

    return (
        <View style={[styles.card, {}]}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
                multiline={true}
            />
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

    input: {
        height: 40,
        margin: 12,
        padding: 10,
    }
})

export default RequestBubble;