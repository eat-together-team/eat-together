import React from "react";
import { View, Image, ImageBackground, Dimensions, StyleSheet } from "react-native";

const GalleryPreview = props =>{
    const numColumns = 3;
    const screenWidth = Dimensions.get("window").width;
    const tileSize = (screenWidth - 2.4 * 5 * numColumns) / numColumns;
  
    return(
        <View style ={styles.row}>
            <Image
              source={
                props.children[0]
                ? { uri: props.children[0].imageUrl }
                : require("../../assets/food.jpg")
              }
              style={{ width: tileSize, height: tileSize, borderRadius: 15, margin:5,}}
            />
            <Image
              source={
                props.children[1]
                ? { uri: props.children[1].imageUrl }
                : require("../../assets/foodBackground.png")

              }
              blurRadius={2}
              style={{ width: tileSize, height: tileSize, borderRadius: 15, margin:5,}}
            />

            <ImageBackground
              source={
                 require("../../assets/food.jpg")
              }
              style={{ width: tileSize/2, height: tileSize, margin:5}}
              borderTopLeftRadius={15}
              borderBottomLeftRadius={15}
              blurRadius={10}
            />

            
        </View>        
    );

}

const styles = StyleSheet.create({ 
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
      flexWrap: "wrap"
    },
  });
  
export default GalleryPreview;