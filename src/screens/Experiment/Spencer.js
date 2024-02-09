import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";
import LargeText from "../../components/LargeText";

const Eric = () => {
    return (
        <View style={styles.eric}>
            <LargeText>Spencer</LargeText>
        </View>
    );
}

const styles = StyleSheet.create({
    eric: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightblue"
    }
});

export default Eric;