// Fields shared by Create offer/request and Edit offer/request. Controlled:
// `form` is the shape from dollarsPostToManageFormState / EMPTY_DOLLARS_FORM,
// and `onChange(patch)` merges a partial update.

import React, { useRef, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../../../rapi_ui_components";

import DropdownField from "../../../components/DropdownField";
import TextInputField from "../../../components/TextInputField";
import InformationCard from "../../../components/InformationCard";
import OutlinePillButton from "../../../components/OutlinePillButton";
import Header4Text from "../../../components/typography/Header4Text";
import BodyText from "../../../components/typography/BodyText";
import DollarsPaymentBadges from "../../../components/DiningDollars/DollarsPaymentBadges";
import DollarsOptionPickerSheet from "../../../components/DiningDollars/DollarsOptionPickerSheet";
import PressableField from "../../Organize/NewEvent/PressableField";

import { colorTokens } from "../../../theme/colorTokens";
import { radiusTokens } from "../../../theme/radiusTokens";
import { AMOUNT_TYPE_OPTIONS } from "./dollarsPostSchema";
import { DOLLARS_LOCATIONS, DOLLARS_PAYMENT_METHODS, getDollarsLocation, getDollarsPaymentMethod } from "./dollarsConstants";

export const EMPTY_DOLLARS_FORM = {
  amountType: "upto",
  postAmount: "",
  postMaxAmount: "",
  postStartDate: null,
  postEndDate: null,
  selectedPayments: [],
  selectedLocations: [],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const amountTypeLabel = (value) => AMOUNT_TYPE_OPTIONS.find((o) => o.value === value)?.label || "";

// Keeps digits and a single decimal point with at most two places.
const sanitizeAmount = (text) => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
};

const SelectedRow = ({ leading, label, onRemove, tokens }) => (
  <View style={[styles.selectedRow, { backgroundColor: tokens.containerMedium }]}>
    {leading}
    <BodyText color={tokens.onContainerMedium} style={styles.selectedLabel}>{label}</BodyText>
    <TouchableOpacity onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${label}`}>
      <Ionicons name="close" size={18} color={tokens.onContainerMedium} />
    </TouchableOpacity>
  </View>
);

export default function DollarsPostForm({ form, onChange, invalidMessage }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const locationSheetRef = useRef();
  const paymentSheetRef = useRef();

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {!!invalidMessage && <InformationCard type="Error" text={invalidMessage} />}

      <View style={styles.section}>
        <Header4Text color={tokens.textMedium}>Amount</Header4Text>
        <View style={styles.amountRow}>
          <View style={styles.amountType}>
            <DropdownField
              placeholder="Amount type"
              value={amountTypeLabel(form.amountType)}
              options={AMOUNT_TYPE_OPTIONS.map((o) => o.label)}
              onSelect={(label) => onChange({ amountType: AMOUNT_TYPE_OPTIONS.find((o) => o.label === label).value })}
            />
          </View>
          <View style={styles.amountValue}>
            <TextInputField
              hint="Amount"
              value={form.postAmount}
              onChangeText={(text) => onChange({ postAmount: sanitizeAmount(text) })}
              keyboardType="decimal-pad"
              leadingIcon={<Ionicons name="logo-usd" size={16} color={tokens.onBackground} />}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Header4Text color={tokens.textMedium}>Available until</Header4Text>
        <PressableField onPress={() => setDatePickerVisible(true)}>
          <TextInputField
            hint="Select a date"
            value={form.postEndDate ? formatDate(form.postEndDate) : ""}
            leadingIcon={<Ionicons name="calendar-outline" size={16} color={tokens.onBackground} />}
          />
        </PressableField>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Header4Text color={tokens.textMedium}>Locations</Header4Text>
          <OutlinePillButton label="Add location" color={tokens.primary} onPress={() => locationSheetRef.current?.open()} />
        </View>
        {form.selectedLocations.map((id) => (
          <SelectedRow
            key={id}
            tokens={tokens}
            leading={<Ionicons name="location-outline" size={16} color={tokens.onContainerMedium} />}
            label={getDollarsLocation(id)?.label || id}
            onRemove={() => onChange({ selectedLocations: form.selectedLocations.filter((x) => x !== id) })}
          />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Header4Text color={tokens.textMedium}>Payment methods</Header4Text>
          <OutlinePillButton label="Add payment method" color={tokens.primary} onPress={() => paymentSheetRef.current?.open()} />
        </View>
        {form.selectedPayments.map((id) => (
          <SelectedRow
            key={id}
            tokens={tokens}
            leading={<DollarsPaymentBadges methods={[id]} size={20} />}
            label={getDollarsPaymentMethod(id)?.label || id}
            onRemove={() => onChange({ selectedPayments: form.selectedPayments.filter((x) => x !== id) })}
          />
        ))}
      </View>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        date={form.postEndDate || new Date()}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(value) => {
          onChange({ postEndDate: value });
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />

      <DollarsOptionPickerSheet
        ref={locationSheetRef}
        title="Locations"
        options={DOLLARS_LOCATIONS}
        selected={form.selectedLocations}
        onDone={(ids) => {
          onChange({ selectedLocations: ids });
          locationSheetRef.current?.close();
        }}
      />
      <DollarsOptionPickerSheet
        ref={paymentSheetRef}
        title="Payment methods"
        options={DOLLARS_PAYMENT_METHODS}
        selected={form.selectedPayments}
        renderLeading={(option) => <DollarsPaymentBadges methods={[option.id]} size={20} />}
        onDone={(ids) => {
          onChange({ selectedPayments: ids });
          paymentSheetRef.current?.close();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 25,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountRow: {
    flexDirection: "row",
    gap: 10,
  },
  amountType: {
    flex: 1,
  },
  amountValue: {
    flex: 1,
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 42,
    borderRadius: radiusTokens.small,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedLabel: {
    flex: 1,
  },
});
