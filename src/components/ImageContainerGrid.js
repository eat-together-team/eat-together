import { FlatList, Dimensions, View, SafeAreaView, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import ImageContainer from "../components/ImageContainer";

// Replace with storage.ref(...) to access images in firebase

const screenWidth = Dimensions.get("window").width;
const numColumns = 3;
const tileSize = (screenWidth - 46) /  numColumns;

const renderImage = async(props) =>{
    return <ImageContainer 
        size={tileSize} 
        uri={props.uri}
    />;
}

export default function Grid(props) {
    const { uri } = props;
    const images = Array.isArray(uri) ? uri.map(url => [url]) : [];

    const renderImage = ({ item }) => (
        <ImageContainer size={tileSize} uri={item[0]} />
    );

    return (
        <ImageContainer 
        size={tileSize} 
        uri={props.uri}
    />

        // <SafeAreaView style={styles.container}>
        //     <View style={styles.inputContainer}>
        //         {/* <FlatList
        //             data={images}
        //             renderItem={renderImage}
        //             numColumns={numColumns}
        //             keyExtractor={(item, index) => index.toString()}
        //             ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        //             contentContainerStyle={{ padding: 5 }}
        //         /> */}
        //     </View>
        // </SafeAreaView>
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
        padding: 5,
    }
})