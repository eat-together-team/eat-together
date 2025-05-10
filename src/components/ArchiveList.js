import React from "react";
import { View, ScrollView, Image } from "react-native";
import NormalText from "./NormalText";

const ArchiveList = props => {
    if (!props.archives || props.archives.length === 0) {
        return (
            <View style={{ padding: 18 }}>
                <NormalText style={{ color: '#888', fontSize: 16 }}>
                    You don't have any archives yet.
                </NormalText>
            </View>
        );
    }
    return (
        <View style={[{ flexDirection: "row" }, props.style]}>
            <ScrollView 
                horizontal={true} 
                style={{ marginVertical: props.marginVertical !== undefined ? 
                                                        props.marginVertical : 0 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}
            >
                {props.archives.map((archive, i) => (
                    <View key={archive.id || i} style={{
                        width: 140,
                        height: 140,
                        marginRight: 16,
                        borderRadius: 16,
                        overflow: 'hidden',
                        backgroundColor: '#eee',
                        position: 'relative',
                        justifyContent: 'flex-end',
                    }}>
                        <Image
                            source={archive.hasImage
                                ? { uri: archive.image }
                                : require("../../assets/foodBackground.png")
                            }
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                            resizeMode="cover"
                        />
                        <View style={{
                            width: '100%',
                            padding: 10,
                            backgroundColor: 'rgba(0,0,0,0.25)',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                        }}>
                            <NormalText 
                                style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }} 
                                numberOfLines={1}>
                                {archive.name || 'Event Title'}
                            </NormalText>
                            <NormalText style={{ color: '#fff', fontSize: 13 }} numberOfLines={1}>
                                {archive.startDate && archive.startDate.toDate ? 
                                        archive.startDate.toDate().toLocaleDateString() : 'Date'}
                            </NormalText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default ArchiveList; 