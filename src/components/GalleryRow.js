import React from "react";
import { View, Image, ScrollView, StyleSheet } from "react-native";

// Just the photos — no captions/event names under each thumbnail. Older
// gallery entries may still carry an imageCaption/eventName field from the
// previous version of this screen, but nothing here ever reads them.
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
            {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                    <Image
                        source={
                            image && image.imageUrl
                            ? { uri: image.imageUrl }
                            : require("../../assets/food.jpg")
                        }
                        style={[styles.image, { width: 150, height: 150 }]}
                    />
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  scrollView: {
    marginVertical: 10,
    alignSelf: "flex-start",
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
});

export default GalleryRow;
