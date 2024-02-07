import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";

const Akash = () => {
    return (
        <View style={styles.eric}>
            <NormalText>Eric Xiao :)</NormalText>
        </View>
    );
}

const styles = StyleSheet.create({
    akash: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightblue"
    }
});

export default Akash;