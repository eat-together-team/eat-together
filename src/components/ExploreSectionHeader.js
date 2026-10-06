import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Header3Text from "./typography/Header3Text";
import SubBodyText from "./typography/SubBodyText";
import { colorTokens } from "../theme/colorTokens";
import { useTheme } from "../rapi_ui_components";

const ExploreSectionHeader = ({ title, onViewAll }) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  return (
    <View style={styles.row}>
      <Header3Text color={tokens.onBackground}>{title}</Header3Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <SubBodyText color={tokens.onBackground} style={styles.viewAll}>
            View all
          </SubBodyText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewAll: {
    opacity: 0.5,
  },
});

export default ExploreSectionHeader;
