import { View, StyleSheet } from "react-native";
import LargeText from "../../components/LargeText";

const EricXiao = () => {
    return (
        <View style={styles.eric}>
            <LargeText>Eric Xiao :)))</LargeText>
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

export default EricXiao;