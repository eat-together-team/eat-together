import React from "react";
import { View, ScrollView, Image } from "react-native";
import NormalText from "./NormalText";

const GalleryList = props => {
    if (!props.images || props.images.length === 0) {
        return (
            <View style={{ padding: 18 }}>
                <NormalText style={{ color: '#888', fontSize: 16 }}>
                    You don't have any photos yet.
                </NormalText>
            </View>
        );
    }
    return (
        <View style={[{ flexDirection: "row" }, props.style]}>
            <ScrollView horizontal={true} style={{ marginVertical: props.marginVertical !== undefined ? props.marginVertical : 0 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}>
                {props.images && props.images.map((img, i) => (
                    <View key={img.imageId || i} style={{
                        width: 140,
                        marginRight: 16,
                        alignItems: 'flex-start',
                        backgroundColor: '#fff',
                    }}>
                        <Image
                            source={{ uri: img.imageUrl }}
                            style={{ width: 140, height: 140, borderRadius: 16, marginBottom: 0 }}
                            resizeMode="cover"
                        />
                        {img.imageCaption && img.imageCaption !== 'Click the Add/Edit Button to insert a caption!' && (
                            <NormalText style={{ fontWeight: 'bold', fontSize: 15, color: '#222', marginTop: 8, marginLeft: 2 }} numberOfLines={1}>
                                {img.imageCaption}
                            </NormalText>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default GalleryList; 