import React from "react";
import { View, ScrollView } from "react-native";

const HorizontalRow = props => {
    return (
        <View style={{ flexDirection: "row" }}>
            <ScrollView horizontal={true} style={{ marginVertical: props.marginVertical ? props.marginVertical : 10 }}>
                {props.children}
            </ScrollView>
        </View>
    );
}

export default HorizontalRow;