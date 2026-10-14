import React from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import Tag from "./Tag";

const TagsList = props => {
    // filter tags by type
    const tags = props.tags || [];
    const filteredTags = props.filterType 
        ? tags.filter(tag => {
            const tagType = tag.type ? tag.type : null;
            return tagType === props.filterType;
        })
        : tags;

    const content = (
        <View 
            style={{ 
                flexDirection: "row", 
                flexWrap: "wrap",
                width: "90%",
                alignSelf: "center",
                justifyContent: props.left ? "flex-start" : "center",
                marginVertical: props.marginVertical ? props.marginVertical : 10,
            }} 
            onStartShouldSetResponder={() => props.remove ? true : false}
        >
            {filteredTags.map((tag, i) => {
                const originalIndex = tags.indexOf(tag);
                return (
                    <View
                        key={tag.tag ? tag.tag : tag}
                        style={[
                            { margin: 2, alignSelf: "flex-start" },
                            Platform.OS === "android" && { borderWidth: 0, borderBottomWidth: 0 },
                        ]}
                    >
                        <Tag 
                            text={tag.tag ? tag.tag : tag} 
                            type={tag.type ? tag.type : null} 
                            remove={props.remove ? () => props.remove(tag, originalIndex) : false}
                        />
                    </View>
                );
            })}
        </View>
    );

    // apply appropriate stylings for tag type
    if (props.filterType) {
        const sectionStyle = props.filterType === "school" 
            ? styles.tagSectionSchool
            : props.filterType === "hobby"
            ? styles.tagSectionHobby
            : styles.tagSectionFood;
        
        return (
            <View style={[styles.tagSection, sectionStyle]}>
                {content}
            </View>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    tagSection: {
        borderWidth: 2,
        borderRadius: 15,
        marginVertical: 8,
    },
    tagSectionFood: {
        borderColor: "#F2E2FC",
        backgroundColor: "#FBF7FE",
    },
    tagSectionHobby: {
        borderColor: "#D5EFFF",
        backgroundColor: "#F4FAFF",
    },
    tagSectionSchool: {
        borderColor: "#F3F0DF",
        backgroundColor: "#FEFDFB",
    },
});

export default TagsList;