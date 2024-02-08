import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";

const Max = () => {
    return (
        <View style={styles.eric}>
            <NormalText>Eric Xiao :)</NormalText>
        </View>
    );
}

const styles = StyleSheet.create({
    Max: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "green"
    }
});

export default Max;