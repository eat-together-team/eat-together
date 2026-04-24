import React, { useMemo, useState } from "react";
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
import firebase from "firebase/compat";
import { auth, db } from "../../../provider/Firebase";
import { buildDollarsPostDocument, DINING_DOLLARS_POSTS_COLLECTION } from "./dollarsPostSchema";

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

const PaymentItem = ({ item, selected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.selectableRow,
      selected && { backgroundColor: DOLLARS_PAYMENT_HIGHLIGHT_COLORS[item.id] || "#A1CCF0" },
    ]}
    onPress={onPress}
  >
    <View style={[styles.methodBadge, { backgroundColor: item.color }]}>
      <Text style={styles.methodBadgeText}>{item.badge}</Text>
    </View>
    <Text style={styles.selectableRowLabel}>{item.label}</Text>
    {selected && <Ionicons name="checkmark" size={18} color="#111" />}
  </TouchableOpacity>
);

const LocationItem = ({ item, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.selectableRow, selected && styles.selectableRowChosen]}
    onPress={onPress}
  >
    <View style={styles.locationBadge}>
      <Text style={styles.locationBadgeText}>{item.short}</Text>
    </View>
    <Text style={styles.selectableRowLabel}>{item.label}</Text>
    {selected && <Ionicons name="checkmark" size={18} color="#777" />}
  </TouchableOpacity>
);

export default function DollarsCreateRequest({ navigation }) {
  const [step, setStep] = useState(1);
  const [requestStartDate, setRequestStartDate] = useState(new Date(2025, 0, 17));
  const [requestEndDate, setRequestEndDate] = useState(new Date(2025, 0, 27));
  const [amountType, setAmountType] = useState("range");
  const [requestAmount, setRequestAmount] = useState("50");
  const [requestMaxAmount, setRequestMaxAmount] = useState("100");
  const [selectedPayments, setSelectedPayments] = useState(["venmo"]);
  const [selectedLocations, setSelectedLocations] = useState(["SB_suzzalo"]);
  const [activePicker, setActivePicker] = useState(null);

  const onConfirmDate = (selectedDate) => {
    if (activePicker === "start") {
      setRequestStartDate(selectedDate);
      if (selectedDate > requestEndDate) {
        setRequestEndDate(selectedDate);
      }
    }
    if (activePicker === "end") {
      setRequestEndDate(selectedDate < requestStartDate ? requestStartDate : selectedDate);
    }
    setActivePicker(null);
  };

  const togglePaymentMethod = (methodId) => {
    setSelectedPayments((curr) =>
      curr.includes(methodId) ? curr.filter((id) => id !== methodId) : [...curr, methodId]
    );
  };

  const toggleLocation = (locationId) => {
    setSelectedLocations((curr) =>
      curr.includes(locationId) ? curr.filter((id) => id !== locationId) : [...curr, locationId]
    );
  };

  const canGoNext = useMemo(() => selectedPayments.length > 0, [selectedPayments.length]);

  const validateRange = () => {
    if (amountType !== "range") return true;
    const lower = Number(requestAmount);
    const upper = Number(requestMaxAmount);

    if (!requestAmount || !requestMaxAmount || Number.isNaN(lower) || Number.isNaN(upper)) {
      Alert.alert("Invalid range", "Please enter both lower and upper bounds.");
      return false;
    }
    if (lower > upper) {
      Alert.alert("Range mismatch", "Lower bound must be less than upper bound.");
      return false;
    }
    if (lower === upper) {
      Alert.alert("Use exact amount", "Bounds are equal. Please use Exact amount instead.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateRange()) return;

    const uid = auth?.currentUser?.uid || firebase.auth().currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in again and try posting.");
      return;
    }

    let ownerDisplayName = "";
    let ownerPhotoUrl = "";
    try {
      const userDoc = await db.collection("Users").doc(uid).get();
      const data = userDoc.exists ? userDoc.data() : null;
      ownerDisplayName = data?.name || data?.displayName || data?.username || "";
      ownerPhotoUrl = data?.image || data?.photoUrl || data?.profilePhotoUrl || "";
    } catch (e) {
    }

    const doc = buildDollarsPostDocument({
      postType: "request",
      amountType,
      postAmount: requestAmount,
      postMaxAmount: requestMaxAmount,
      postStartDate: requestStartDate,
      postEndDate: requestEndDate,
      selectedPayments,
      selectedLocations,
      ownerID: uid,
      ownerDisplayName,
      ownerPhotoUrl,
    });

    try {
      await db.collection(DINING_DOLLARS_POSTS_COLLECTION).add(doc);
      navigation.replace("DollarsExchange", {
        showPostedPopup: true,
        postType: "request",
      });
    } catch (e) {
      Alert.alert("Couldn't post", e?.message || "Please try again.");
    }
  };

  return (
    <Layout style={styles.layout}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Create request</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {step === 1 && (
          <>
            <Text style={styles.sectionLabel}>Set active period of your request:</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.inputCardSmall} onPress={() => setActivePicker("start")}>
                <Ionicons name="calendar-outline" size={17} color="#777" />
                <Text style={styles.inputText}>{formatShortDate(requestStartDate)}</Text>
              </TouchableOpacity>

              <View style={styles.dateDivider} />

              <TouchableOpacity style={styles.inputCardSmall} onPress={() => setActivePicker("end")}>
                <Ionicons name="calendar-outline" size={17} color="#777" />
                <Text style={styles.inputText}>{formatShortDate(requestEndDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, styles.spacingTop]}>Set request amount</Text>
            <View style={styles.inputCardLarge}>
              <Ionicons name="wallet-outline" size={17} color="#777" />
              <Text style={styles.amountPrefix}>$</Text>
              <TextInput
                value={requestAmount}
                onChangeText={(value) => setRequestAmount(value.replace(/[^0-9.]/g, ""))}
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
                    value={requestMaxAmount}
                    onChangeText={(value) => setRequestMaxAmount(value.replace(/[^0-9.]/g, ""))}
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
                <PaymentItem
                  key={method.id}
                  item={method}
                  selected={selectedPayments.includes(method.id)}
                  onPress={() => togglePaymentMethod(method.id)}
                />
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.sectionLabel}>Set preferred locations</Text>
            <View style={styles.listGap}>
              {DOLLARS_LOCATIONS.map((location) => (
                <LocationItem
                  key={location.id}
                  item={location}
                  selected={selectedLocations.includes(location.id)}
                  onPress={() => toggleLocation(location.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomArea}>
        {step === 1 ? (
          <TouchableOpacity
            style={[styles.primaryButton, !canGoNext && styles.primaryButtonDisabled]}
            onPress={() => {
              if (!validateRange()) return;
              setStep(2);
            }}
            disabled={!canGoNext}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButtonSmall} onPress={submit}>
              <Text style={styles.primaryButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DateTimePickerModal
        isVisible={activePicker !== null}
        mode="date"
        date={activePicker === "end" ? requestEndDate : requestStartDate}
        minimumDate={activePicker === "end" ? requestStartDate : new Date()}
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
    fontSize: 28 / 1.55,
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
    paddingBottom: 120,
  },
  sectionLabel: {
    fontSize: 10,
    color: "rgba(0,0,0,0.7)",
    marginBottom: 10,
  },
  spacingTop: {
    marginTop: 20,
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
    fontSize: 24 / 1.6,
    color: "rgba(0,0,0,0.7)",
  },
  amountPrefix: {
    marginLeft: 10,
    marginRight: 2,
    fontSize: 24 / 1.6,
    color: "rgba(0,0,0,0.7)",
  },
  amountInput: {
    flex: 1,
    fontSize: 24 / 1.6,
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
    backgroundColor: "#DADADA",
    borderWidth: 1,
    borderColor: "#CCCCCC",
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
  methodBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  locationBadge: {
    width: 25,
    height: 25,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#CCC",
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  locationBadgeText: {
    fontSize: 9,
    color: "#5B5B5B",
    fontWeight: "600",
  },
  bottomArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: "#F0F0F0",
  },
  primaryButton: {
    height: 41,
    borderRadius: 10,
    backgroundColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonSmall: {
    flex: 1,
    height: 41,
    borderRadius: 10,
    backgroundColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 13,
    color: "#F7F7F7",
    fontWeight: "600",
  },
  bottomButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  secondaryButton: {
    flex: 1,
    height: 41,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#5DB075",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    color: "#5DB075",
    fontWeight: "600",
  },
});
