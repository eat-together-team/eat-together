import React from 'react';
import { View, StyleSheet, Dimensions, TextInput } from 'react-native';
import Button from './Button';

const RequestBubble = (props) => {
    const [text, onChangeText] = React.useState('Hello, my name is Name X. I would love for you to become my buddy!');

    return (
        <View style={styles.card}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
                multiline={true}
                placeholder="Type your message here"
            />
            <View style={styles.buttonContainer}>
                <Button
                    marginHorizontal={5}  // Adjust margin to control horizontal spacing
                    marginVertical={8}    // Added a bit of vertical spacing between buttons
                    paddingVertical={10}
                    width={Dimensions.get('screen').width - 40}
                    height={55}
                    paddingHorizontal={20}
                    fontSize={14}
                    onPress={props.onPress}
                >
                    Send message
                </Button>

                <Button
                    marginHorizontal={5}  // Adjust margin to control horizontal spacing
                    marginVertical={8}    // Added a bit of vertical spacing between buttons
                    paddingVertical={10}
                    width={Dimensions.get('screen').width - 40}
                    height={55}
                    paddingHorizontal={20}
                    fontSize={14}
                    onPress={props.onSendWithoutMessagePress}
                >
                    Send without message
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        paddingHorizontal: 15,
        paddingTop: 10,
        width: Dimensions.get('screen').width - 40,
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "#DEE9DB",
        alignItems: "center",
        justifyContent: 'center',
    },
    input: {
        height: 40,
        margin: 12,
        padding: 10,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export default RequestBubble;
