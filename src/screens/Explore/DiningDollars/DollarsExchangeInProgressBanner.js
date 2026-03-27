import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GREEN_MAIN = "#5DB075";
const GRAY_100 = "#F7F7F7";

export default function DollarsExchangeInProgressBanner({
  partnerName = "Arya",
  onCompleteExchange,
}) {
  const [expanded, setExpanded] = useState(true);

  const handleMinimize = () => setExpanded(false);
  const handleExpand = () => setExpanded(true);

  if (expanded) {
    return (
      <View style={styles.expandedCard}>
        <Text style={styles.bodyText}>
          This chat is part of a dining dollar exchange. Chat with{" "}
          <Text style={styles.nameBold}>{partnerName}</Text>
          {" "}to find a time and place to meet and exchange.
          {"\n\n"}
          Once you complete the transaction, click below to mark as{" "}
          <Text style={styles.completeBold}>complete</Text>
          {" "}so that we can archive your post
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onCompleteExchange}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Complete exchange</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.minimizeButton}
          onPress={handleMinimize}
          activeOpacity={0.85}
        >
          <Text style={styles.minimizeButtonText}>Minimize</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.minimizedCard}
      onPress={handleExpand}
      activeOpacity={0.9}
    >
      <Text style={styles.minimizedTitle}>Dining dollar exchange in progress</Text>
      <Text style={styles.minimizedHint}>Tap to learn more</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  expandedCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  bodyText: {
    fontSize: 11,
    color: "#000",
    lineHeight: 16,
    marginBottom: 16,
  },
  nameBold: {
    fontWeight: "600",
  },
  completeBold: {
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: GREEN_MAIN,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 65,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: GRAY_100,
  },
  minimizeButton: {
    borderWidth: 2,
    borderColor: GREEN_MAIN,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  minimizeButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: GREEN_MAIN,
  },
  minimizedCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },
  minimizedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  minimizedHint: {
    fontSize: 11,
    fontWeight: "400",
    color: "#000",
  },
});
