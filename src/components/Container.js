import React from "react";
import { Section } from "react-native-rapi-ui";

const DarkContainer = props => {
    return (
        <Section backgroundColor="#D9D9D9" style={{
            marginVertical: props.marginVertical ? props.marginVertical : 0,
            width: props.width ? props.width : "auto",
            paddingVertical: 20,
            paddingHorizontal: 20
        }} borderRadius={20}>
            {props.children}
        </Section>
    );
}

export default DarkContainer;