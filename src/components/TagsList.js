import React from "react";
import { View, ScrollView } from "react-native";
import Tag from "./Tag";

const TagsList = props => {
    return (
        <View style={{ flexDirection: "row" }} onStartShouldSetResponder={() => props.remove ? true : false}>
            <ScrollView horizontal={true} style={{ marginVertical: props.marginVertical ? props.marginVertical : 10 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: props.left ? "flex-start" : "center" }}>
            {props.tags.map((tag, i) => <Tag text={tag.tag ? tag.tag : tag} key={tag.tag ? tag.tag : tag}
                type={tag.type ? tag.type : null} remove={props.remove ? () => props.remove(tag, i) : false}/>)}
            </ScrollView>
        </View>
    );
}

export default TagsList;