import { FlatList, Dimensions, View, SafeAreaView, StyleSheet } from "react-native";
import React, { useState } from "react";
import ImageContainer from "../components/ImageContainer";

// Replace with storage.ref(...) to access images in firebase
const imageArr = new Array(9);

const screenWidth = Dimensions.get("window").width;
const numColumns = 3;
const tileSize = (screenWidth - 46) /  numColumns;

function renderImage({ image }) {
    return <ImageContainer 
        size={tileSize} 
        uri={image}
    />;
}

export default function Grid() {
    const [images, setImages] = useState(imageArr);
    return (
        <SafeAreaView style={styles.container}>
            <View style = {styles.inputContainer}>
                <FlatList
                    data={images}
                    renderItem={renderImage}
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    numColumns={3}
                    key={3}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    inputContainer: {
        width: screenWidth,
        padding: 15
    }
})