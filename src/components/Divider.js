import React from "react";
import { View } from "react-native";
import { useTheme } from "../rapi_ui_components";
import { colorTokens } from "../theme/colorTokens";

// A hairline separator between grouped content, e.g. settings sections.
const Divider = ({ style }) => {
    const { theme } = useTheme();
    const tokens = colorTokens[theme];

    return <View style={[{ height: 1, backgroundColor: tokens.containerHigh }, style]} />;
};

export default Divider;
