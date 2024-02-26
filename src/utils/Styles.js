import { Dimensions } from 'react-native';

export const commonStyles = {
    outline: {
        padding: 10,
        width: Dimensions.get('screen').width - 50,
        marginVertical: 5,
        borderWidth: 3,
        borderRadius: 12.5,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        shadowColor: "#000000",
        shadowOpacity: 0.25,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 10
    },
    image: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 10
    },
    checkMark: {
        position: "absolute",
        right: 15,
        top: "45%"
    }
};
