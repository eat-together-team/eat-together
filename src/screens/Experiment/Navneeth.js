import { View, StyleSheet } from "react-native";
import NormalText from "../../components/NormalText";

const Navneeth = () => {
    return (

        <View style={styles.navneeth}>
            <NormalText>Eric Xiao :)</NormalText>
        </View>
    );
}

const styles = StyleSheet.create({
    navneeth: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "lightblue"
    }
});

export default Navneeth;