// Multi-select bottom sheet behind "Add location" / "Add payment method".
// Selection is staged locally and only handed back on Done, so dragging the
// sheet away leaves the form unchanged.

import React, { forwardRef, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RBSheet from "react-native-raw-bottom-sheet";
import { useTheme } from "../../rapi_ui_components";
import { colorTokens } from "../../theme/colorTokens";
import { radiusTokens } from "../../theme/radiusTokens";
import Header3Text from "../typography/Header3Text";
import BodyText from "../typography/BodyText";
import LargeButton from "../LargeButton";

const SHEET_HEIGHT = Dimensions.get("window").height * 0.75;

// `options`: [{ id, label }]; `renderLeading(option)` optionally draws an icon/badge.
const DollarsOptionPickerSheet = forwardRef(({ title, options, selected, onDone, renderLeading }, ref) => {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [staged, setStaged] = useState(selected);

  const toggle = (id) =>
    setStaged((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <RBSheet
      ref={ref}
      height={SHEET_HEIGHT}
      closeOnDragDown={true}
      closeOnPressMask={true}
      onOpen={() => setStaged(selected)}
      customStyles={{
        wrapper: { backgroundColor: "rgba(0,0,0,0.5)" },
        draggableIcon: { backgroundColor: tokens.textLight },
        container: {
          backgroundColor: tokens.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
        },
      }}
    >
      <View style={styles.container}>
        <Header3Text color={tokens.onBackground}>{title}</Header3Text>
        <ScrollView contentContainerStyle={styles.list}>
          {options.map((option) => {
            const checked = staged.includes(option.id);
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => toggle(option.id)}
                style={[
                  styles.row,
                  { backgroundColor: checked ? `${tokens.primaryContainer}80` : tokens.containerMedium },
                ]}
              >
                {renderLeading?.(option)}
                <BodyText color={tokens.onContainerMedium} style={styles.label}>{option.label}</BodyText>
                <Ionicons
                  name={checked ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={checked ? tokens.primary : tokens.textLight}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <LargeButton color="green" onPress={() => onDone(staged)}>
          Done
        </LargeButton>
      </View>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
    borderRadius: radiusTokens.small,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    flex: 1,
  },
});

export default DollarsOptionPickerSheet;
