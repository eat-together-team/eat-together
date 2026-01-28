import React from "react";
import { View, Image, ScrollView, StyleSheet } from "react-native";
import NormalText from "./NormalText";

const GalleryRow = props => {
    const images = props.images || [];
    
    if (images.length === 0) {
        return null;
    }
    
    return(
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            style={styles.scrollView}
        >
            {images.map((image, index) => {
                const caption = image && image.imageCaption 
                    ? image.imageCaption 
                    : '';
                const displayCaption = caption && caption !== 'Click the Add/Edit Button to insert a caption!' 
                    ? caption 
                    : '';
                
                return (
                    <View key={index} style={styles.imageContainer}>
                        <Image
                            source={
                                image && image.imageUrl
                                ? { uri: image.imageUrl }
                                : require("../../assets/food.jpg")
                            }
                            style={[styles.image, { width: 150, height: 150 }]}
                        />
                        <NormalText style={styles.caption} numberOfLines={2}>
                            {displayCaption}
                        </NormalText>
                        <NormalText style={styles.name}>
                            {image && image.eventName ? image.eventName : ''}
                        </NormalText>
                    </View>
                );
            })}
        </ScrollView>        
    );
}

const styles = StyleSheet.create({ 
  scrollView: {
    marginVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 5,
  },
  imageContainer: {
    margin: 5,
    width: 150,
    alignItems: "center",
  },
  image: {
    borderRadius: 10,
  },
  caption: {
    marginTop: 5,
    textAlign: "left",
    width: "100%",
    alignSelf: "flex-start",
  },
  name: {
    marginTop: 4,
    textAlign: "left",
    width: "100%",
    color: "grey",
    alignSelf: "flex-start",
  },
});
  
export default GalleryRow;
