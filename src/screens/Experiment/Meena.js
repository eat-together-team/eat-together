import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";

const Meena = () => {
    return (
        <View style={styles.eric}>
            <NormalText>Meena Kuduva :D</NormalText>
        </View>
    );
}

const styles = StyleSheet.create({
    eric: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightpink"
    }
});

export default Meena;