import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Layout } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DOLLARS_LOCATIONS, DOLLARS_PAYMENT_HIGHLIGHT_COLORS, DOLLARS_PAYMENT_METHODS } from "./dollarsConstants";

const PRICE_OPTIONS = [
  { id: "exact", label: "Exact amount" },
  { id: "upto", label: "Up to" },
  { id: "more", label: "Or more" },
  { id: "range", label: "Range" },
];

const formatShortDate = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

const SelectableRow = ({ label, badge, badgeColor, selected, onPress, selectedColor, selectedCheckColor }) => (
  <TouchableOpacity
    style={[
      styles.selectableRow,
      selected && (selectedColor ? { backgroundColor: selectedColor } : styles.selectableRowChosen),
    ]}
    onPress={onPress}
  >
    <View style={[styles.methodBadge, badgeColor ? { backgroundColor: badgeColor } : styles.locationBadge]}>
      <Text style={styles.methodBadgeText}>{badge}</Text>
    </View>
    <Text style={styles.selectableRowLabel}>{label}</Text>
    {selected && <Ionicons name="checkmark" size={18} color={selectedCheckColor || "#777"} />}
  </TouchableOpacity>
);

export default function DollarsManagePost({ navigation }) {
  const [offerStartDate, setOfferStartDate] = useState(new Date(2025, 0, 17));
  const [offerEndDate, setOfferEndDate] = useState(new Date(2025, 0, 27));
  const [amountType, setAmountType] = useState("exact");
  const [offerAmount, setOfferAmount] = useState("75");
  const [offerMaxAmount, setOfferMaxAmount] = useState("50");
  const [selectedPayments, setSelectedPayments] = useState(["venmo"]);
  const [selectedLocations, setSelectedLocations] = useState(["suzzalo"]);
  const [activePicker, setActivePicker] = useState(null);

  const onConfirmDate = (selectedDate) => {
    if (activePicker === "start") {
      setOfferStartDate(selectedDate);
      if (selectedDate > offerEndDate) setOfferEndDate(selectedDate);
    }
    if (activePicker === "end") {
      setOfferEndDate(selectedDate < offerStartDate ? offerStartDate : selectedDate);
    }
    setActivePicker(null);
  };

  const togglePaymentMethod = (methodId) => {
    setSelectedPayments((curr) =>
      curr.includes(methodId) ? curr.filter((id) => id !== methodId) : [...curr, methodId]
    );
  };

  const toggleLocation = (locationId) => {
    setSelectedLocations((curr) => {
      if (curr.includes(locationId)) {
        // Keep at least one preferred location selected.
        if (curr.length === 1) return curr;
        return curr.filter((id) => id !== locationId);
      }
      return [...curr, locationId];
    });
  };

  return (
    <Layout style={styles.layout}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage post</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionLabel}>Set active period of your offer:</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.inputCardSmall} onPress={() => setActivePicker("start")}>
            <Ionicons name="calendar-outline" size={17} color="#777" />
            <Text style={styles.inputText}>{formatShortDate(offerStartDate)}</Text>
          </TouchableOpacity>

          <View style={styles.dateDivider} />

          <TouchableOpacity style={styles.inputCardSmall} onPress={() => setActivePicker("end")}>
            <Ionicons name="calendar-outline" size={17} color="#777" />
            <Text style={styles.inputText}>{formatShortDate(offerEndDate)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionLabel, styles.spacingTop]}>Set offer amount</Text>
        <View style={styles.inputCardLarge}>
          <Ionicons name="wallet-outline" size={17} color="#777" />
          <Text style={styles.amountPrefix}>$</Text>
          <TextInput
            value={offerAmount}
            onChangeText={(value) => setOfferAmount(value.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={[styles.amountInput, amountType === "range" && styles.rangeAmountInput]}
          />
          {amountType === "range" && (
            <>
              <Text style={styles.rangeDash}>-</Text>
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                value={offerMaxAmount}
                onChangeText={(value) => setOfferMaxAmount(value.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="rgba(0,0,0,0.35)"
                style={[styles.amountInput, styles.rangeAmountInput]}
              />
            </>
          )}
        </View>

        <View style={styles.pillRow}>
          {PRICE_OPTIONS.map((option) => {
            const active = amountType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.choicePill, active && styles.choicePillActive]}
                onPress={() => setAmountType(option.id)}
              >
                <Text style={[styles.choicePillText, active && styles.choicePillTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, styles.spacingTop]}>Set accepted payment methods:</Text>
        <View style={styles.listGap}>
          {DOLLARS_PAYMENT_METHODS.map((method) => (
            <SelectableRow
              key={method.id}
              label={method.label}
              badge={method.badge}
              badgeColor={method.color}
              selected={selectedPayments.includes(method.id)}
              onPress={() => togglePaymentMethod(method.id)}
              selectedColor={DOLLARS_PAYMENT_HIGHLIGHT_COLORS[method.id]}
              selectedCheckColor="#111"
            />
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.spacingTopLarge]}>Set preferred locations</Text>
        <View style={styles.listGap}>
          {DOLLARS_LOCATIONS.map((location) => (
            <SelectableRow
              key={location.id}
              label={location.label}
              selected={selectedLocations.includes(location.id)}
              onPress={() => toggleLocation(location.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (amountType === "range") {
              const lower = Number(offerAmount);
              const upper = Number(offerMaxAmount);

              if (!offerAmount || !offerMaxAmount || Number.isNaN(lower) || Number.isNaN(upper)) {
                Alert.alert("Invalid range", "Please enter both lower and upper bounds.");
                return;
              }
              if (lower > upper) {
                Alert.alert("Range mismatch", "Lower bound must be less than upper bound.");
                return;
              }
              if (lower === upper) {
                Alert.alert("Use exact amount", "Bounds are equal. Please use Exact amount instead.");
                return;
              }
            }
            Alert.alert("Saved", "Post details updated locally.");
          }}
        >
          <Text style={styles.primaryButtonText}>Save post</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={activePicker !== null}
        mode="date"
        date={activePicker === "end" ? offerEndDate : offerStartDate}
        minimumDate={activePicker === "end" ? offerStartDate : new Date()}
        onConfirm={onConfirmDate}
        onCancel={() => setActivePicker(null)}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: "#fff",
  },
  topBar: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#D9D9D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },
  backButton: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    color: "#111",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 110,
  },
  sectionLabel: {
    fontSize: 10,
    color: "rgba(0,0,0,0.7)",
    marginBottom: 10,
  },
  spacingTop: {
    marginTop: 20,
  },
  spacingTopLarge: {
    marginTop: 28,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateDivider: {
    width: 12,
    borderTopWidth: 1,
    borderTopColor: "#7E7E7E",
    marginHorizontal: 8,
  },
  inputCardSmall: {
    flex: 1,
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CACACA",
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputCardLarge: {
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CACACA",
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputText: {
    marginLeft: 10,
    fontSize: 15,
    color: "rgba(0,0,0,0.7)",
  },
  amountPrefix: {
    marginLeft: 10,
    marginRight: 2,
    fontSize: 15,
    color: "rgba(0,0,0,0.7)",
  },
  amountInput: {
    flex: 1,
    fontSize: 15,
    color: "rgba(0,0,0,0.7)",
    paddingVertical: 0,
  },
  rangeAmountInput: {
    flex: 0,
    width: 60,
  },
  rangeDash: {
    marginHorizontal: 5,
    fontSize: 16,
    color: "rgba(0,0,0,0.7)",
  },
  pillRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  choicePill: {
    height: 25,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginRight: 8,
    backgroundColor: "transparent",
  },
  choicePillActive: {
    backgroundColor: "#5DB075",
  },
  choicePillText: {
    fontSize: 11,
    color: "#5DB075",
  },
  choicePillTextActive: {
    color: "#fff",
  },
  listGap: {
    gap: 7,
  },
  selectableRow: {
    height: 46,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  selectableRowChosen: {
    backgroundColor: "#CCCCCC",
  },
  selectableRowLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: "rgba(0,0,0,0.7)",
  },
  methodBadge: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  locationBadge: {
    backgroundColor: "#EFEFEF",
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#CCC",
  },
  methodBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingVertical: 18,
    backgroundColor: "#F0F0F0",
  },
  primaryButton: {
    height: 41,
    borderRadius: 10,
    backgroundColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 13,
    color: "#F7F7F7",
    fontWeight: "600",
  },
});
