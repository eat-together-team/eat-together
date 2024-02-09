import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";

const Helen = () => {
    return (
        <View style={styles.helen}>
            <NormalText>Helen! :)</NormalText>
        </View>
    );
}

const styles = StyleSheet.create({
    helen: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightblue"
    }
});

export default Helen;