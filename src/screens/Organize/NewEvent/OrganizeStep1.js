// Step 1 of the new-event wizard — title, cover image, type, date/time,
// description. Receives its fields + setters from OrganizeFlow.js, same
// prop-drilling shape CreateAccountProfile.js uses for CreateAccountFlow.js.

import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { colorTokens } from "../../../theme/colorTokens";
import { radiusTokens } from "../../../theme/radiusTokens";
import { useTheme } from "../../../rapi_ui_components";

import TextInputField from "../../../components/TextInputField";
import DropdownField from "../../../components/DropdownField";
import InformationCard from "../../../components/InformationCard";
import PressableField from "./PressableField";

import getTime from "../../../utils/getTime";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const formatDate = (date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const TYPE_OPTIONS = ["Public", "Private"];

export default function OrganizeStep1({
  title,
  setTitle,
  image,
  setImage,
  type,
  setType,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  description,
  setDescription,
  error,
  datePickerVisible,
  setDatePickerVisible,
  startTimePickerVisible,
  setStartTimePickerVisible,
  endTimePickerVisible,
  setEndTimePickerVisible,
}) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const errorOpacity = useRef(new Animated.Value(0)).current;
  const errorHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(errorOpacity, { toValue: error ? 1 : 0, duration: error ? 250 : 200, useNativeDriver: false }),
      Animated.spring(errorHeight, { toValue: error ? 1 : 0, friction: 8, tension: 40, useNativeDriver: false }),
    ]).start();
  }, [error]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) setImage(result.assets[0].uri);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        style={[
          styles.errorContainer,
          { opacity: errorOpacity, maxHeight: errorHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) },
        ]}
      >
        {error && <InformationCard type="Error" text={error} />}
      </Animated.View>

      <TextInputField
        hint="Event title"
        value={title}
        onChangeText={setTitle}
        leadingIcon={<Ionicons name="text-outline" size={16} color={tokens.onBackground} />}
      />

      {image ? (
        <View style={styles.imageBox}>
          <Image source={{ uri: image }} style={styles.image} contentFit="cover" />
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: tokens.background }]}
            onPress={() => setImage("")}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={16} color={tokens.onBackground} />
          </TouchableOpacity>
        </View>
      ) : (
        <PressableField onPress={handlePickImage}>
          <View style={[styles.imagePlaceholder, { backgroundColor: tokens.containerLow, borderColor: tokens.textLight }]}>
            <Ionicons name="images-outline" size={25} color={tokens.textLight} />
            <Text style={[styles.imagePlaceholderLabel, { color: tokens.textLight }]}>Add cover image</Text>
          </View>
        </PressableField>
      )}

      <DropdownField
        placeholder="Type"
        value={type ? type.charAt(0).toUpperCase() + type.slice(1) : ""}
        onSelect={(option) => setType(option.toLowerCase())}
        options={TYPE_OPTIONS}
        leadingIcon={<Ionicons name="lock-closed-outline" size={16} color={tokens.onBackground} />}
      />

      <PressableField onPress={() => setDatePickerVisible(true)}>
        <TextInputField
          hint="Event date"
          value={date ? formatDate(date) : ""}
          leadingIcon={<Ionicons name="calendar-outline" size={16} color={tokens.onBackground} />}
        />
      </PressableField>

      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <PressableField onPress={() => setStartTimePickerVisible(true)}>
            <TextInputField
              hint="Start time"
              value={startTime ? getTime(startTime) : ""}
              leadingIcon={<Ionicons name="time-outline" size={16} color={tokens.onBackground} />}
            />
          </PressableField>
        </View>
        <View style={styles.timeField}>
          <PressableField onPress={() => setEndTimePickerVisible(true)}>
            <TextInputField
              hint="End time"
              value={endTime ? getTime(endTime) : ""}
              leadingIcon={<Ionicons name="time-outline" size={16} color={tokens.onBackground} />}
            />
          </PressableField>
        </View>
      </View>

      <TextInputField
        hint="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.description}
      />

      <DateTimePickerModal
        isVisible={datePickerVisible}
        date={date || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(value) => {
          setDate(value);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={startTimePickerVisible}
        date={startTime || new Date()}
        mode="time"
        onConfirm={(value) => {
          setStartTime(value);
          setStartTimePickerVisible(false);
        }}
        onCancel={() => setStartTimePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={endTimePickerVisible}
        date={endTime || new Date()}
        mode="time"
        onConfirm={(value) => {
          setEndTime(value);
          setEndTimePickerVisible(false);
        }}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 15,
  },
  errorContainer: {
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 159,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: radiusTokens.small,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  imagePlaceholderLabel: {
    fontSize: 13,
  },
  imageBox: {
    height: 170,
    borderRadius: radiusTokens.small,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 30,
    height: 30,
    borderRadius: radiusTokens.small,
    alignItems: "center",
    justifyContent: "center",
  },
  timeRow: {
    flexDirection: "row",
    gap: 15,
  },
  timeField: {
    flex: 1,
  },
  description: {
    height: 126,
  },
});
