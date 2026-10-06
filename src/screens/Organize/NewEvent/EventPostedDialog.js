// Shown as a Modal overlay on top of step 4 once the event has actually
// been created/updated in Firestore (see OrganizeFlow.js's
// handlePost/handleSaveChanges). `title` swaps between "Event posted!" and
// "Event updated!" — the rest of the copy and both actions are identical
// either way.

import React from "react";
import { View, Text, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colorTokens } from "../../../theme/colorTokens";
import { radiusTokens } from "../../../theme/radiusTokens";
import { useTheme } from "../../../rapi_ui_components";
import LargeButton from "../../../components/LargeButton";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const ordinal = (day) => {
  if (day % 10 === 1 && day !== 11) return day + "st";
  if (day % 10 === 2 && day !== 12) return day + "nd";
  if (day % 10 === 3 && day !== 13) return day + "rd";
  return day + "th";
};
const formatScheduledDate = (date) =>
  `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${ordinal(date.getDate())} ${date.getFullYear()}`;

export default function EventPostedDialog({ visible, title = "Event posted!", date, onInviteFriends, onClose }) {
  const { theme } = useTheme();
  const tokens = colorTokens[theme];

  // Modal still renders its children even while `visible={false}` — guard
  // against being mounted before an event has actually been posted (and
  // `date` set) rather than relying on the caller to only mount this once
  // `posted` is true.
  if (!date) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.scrim, { backgroundColor: `${tokens.onBackground}26` }]}>
        <View style={[styles.card, { backgroundColor: tokens.background }]}>
          <View style={styles.header}>
            <Ionicons name="checkmark-circle" size={40} color={tokens.primary} />
            <Text style={[styles.title, { color: tokens.onBackground }]}>{title}</Text>
          </View>

          <Text style={[styles.body, { color: tokens.onBackground }]}>
            To edit your event, visit <Ionicons name="fast-food-outline" size={12} color={tokens.onBackground} />
            {" "}
            <Text style={styles.bold}>My events</Text>
            {"\n\n"}
            Your event is scheduled for <Text style={styles.bold}>{formatScheduledDate(date)}</Text>
          </Text>

          <View style={styles.buttons}>
            <LargeButton color="green" onPress={onInviteFriends}>
              Invite friends
            </LargeButton>
            <LargeButton outlined color={tokens.outline} onPress={onClose}>
              Close
            </LargeButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: 350,
    borderRadius: radiusTokens.medium,
    padding: 20,
    gap: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  bold: {
    fontWeight: "700",
  },
  buttons: {
    width: "100%",
    gap: 10,
  },
});
