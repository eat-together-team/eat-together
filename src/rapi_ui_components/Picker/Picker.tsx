import React from "react";
import {
  ColorValue,
  TouchableOpacity,
  Modal,
  View,
  ViewStyle,
  ScrollView,
  Dimensions,
} from "react-native";
import Text from "../Text/Text";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../provider/ThemeProvider";

const { width, height } = Dimensions.get("screen");

const fontSize = { sm: 12, md: 14, lg: 16, xl: 18 } as const;

const THEME_COLORS = {
  light: {
    borderColor: "#8E8E93",
    backgroundColor: "#FFFFFF",
    selectionBackgroundColor: "#F2F2F7",
    iconColor: "#8E8E93",
    labelColor: "#000000",
    closeIconColor: "#8E8E93",
    placeholderColor: "#8E8E93",
  },
  dark: {
    borderColor: "#636366",
    backgroundColor: "#1C1C1E",
    selectionBackgroundColor: "#2C2C2E",
    iconColor: "#8E8E93",
    labelColor: "#FFFFFF",
    closeIconColor: "#8E8E93",
    placeholderColor: "#8E8E93",
  },
} as const;

interface Props {
  items: items[];
  placeholder: string;
  value?: string | null;
  onValueChange?: (val: string) => void;
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: number;
  backgroundColor?: ColorValue;
  selectionBackgroundColor?: ColorValue;
  selectionBorderRadius?: number;
  iconColor?: ColorValue;
  labelColor?: ColorValue;
  closeIconColor?: ColorValue;
  labelSize?: keyof typeof fontSize;
  placeholderSize?: keyof typeof fontSize;
  placeholderColor?: ColorValue;
  disabled?: boolean;
}

interface items {
  label: string;
  value: string;
}

const Picker: React.FC<Props> = ({
  items,
  placeholder,
  value,
  onValueChange,
  borderColor,
  borderWidth = 1,
  borderRadius = 8,
  backgroundColor,
  selectionBackgroundColor,
  selectionBorderRadius = 8,
  iconColor,
  labelColor,
  closeIconColor,
  labelSize = "lg",
  placeholderSize = "md",
  placeholderColor,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const themeDefaults = THEME_COLORS[theme];

  const selectedBorderColor = borderColor ?? themeDefaults.borderColor;
  const selectedBackgroundColor = backgroundColor ?? themeDefaults.backgroundColor;
  const selectedSelectionBackgroundColor =
    selectionBackgroundColor ?? themeDefaults.selectionBackgroundColor;
  const selectedIconColor = iconColor ?? themeDefaults.iconColor;
  const selectedLabelColor = labelColor ?? themeDefaults.labelColor;
  const selectedCloseIconColor = closeIconColor ?? themeDefaults.closeIconColor;
  const selectedPlaceholderColor =
    placeholderColor ?? themeDefaults.placeholderColor;

  const [toggleModal, setToggleModal] = React.useState(false);

  const selected = items.find((o) => o.value === value);

  const [selectedValue, setSelectedValue] = React.useState<
    items | undefined | null
  >(value ? selected : null);

  const renderPickerItems = () => {
    return items.map((item, index) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onValueChange && onValueChange(item.value);
            setSelectedValue(item);
            setToggleModal(!toggleModal);
          }}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}
        >
          <Text
            style={{ color: selectedLabelColor }}
            size={labelSize}
            fontWeight={selectedValue?.value == item.value ? "bold" : "regular"}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={toggleModal}
        onRequestClose={() => {
          setToggleModal(!toggleModal);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <View
            style={{
              backgroundColor: themeDefaults.backgroundColor,
              borderRadius: 8,
              width: width - 40,
              maxHeight: height - 300,
            }}
          >
            <View
              style={{
                padding: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: selectedSelectionBackgroundColor,
                borderRadius: selectionBorderRadius,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: selectedLabelColor }} fontWeight="bold">
                  {placeholder}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setToggleModal(!toggleModal);
                }}
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 4,
                  backgroundColor: selectedCloseIconColor,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderPickerItems()}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        onPress={() => {
          setToggleModal(!toggleModal);
        }}
        style={{
          backgroundColor: selectedBackgroundColor,
          borderColor: selectedBorderColor,
          borderWidth: borderWidth,
          borderRadius: borderRadius,
          flexDirection: "row",
          padding: 14,
          paddingHorizontal: 20,
          alignItems: "center",
          justifyContent: "space-between",
        }}
        disabled={disabled}
      >
        <Text
          style={{
            color: selectedValue
              ? selectedLabelColor
              : selectedPlaceholderColor,
            marginRight: 5,
          }}
          size={placeholderSize}
        >
          {selectedValue?.label || placeholder}
        </Text>
        <Ionicons name="caret-down" size={18} color={selectedIconColor} />
      </TouchableOpacity>
    </>
  );
};

export default Picker;
