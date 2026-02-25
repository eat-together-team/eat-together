//Controls style of text in bottom navigation bar

import React from "react";
import {Text, themeColor, useTheme} from "../../rapi_ui_components";

export default (props) => {
    const {isDarkmode} = useTheme();
    return (
        <Text
            fontWeight="bold"
            style={{
                marginBottom: 5,
                color: props.focused
                    ? isDarkmode
                        ? "#f7f7f7"
                        : "#3366FF"
                    : "rgb(143, 155, 179)",
                fontSize: 10,
            }}
        >
            {props.title}
        </Text>
    );
};
