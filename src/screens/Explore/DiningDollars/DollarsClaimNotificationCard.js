import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CARD_BORDER = "#5FB173";
const CHAT_BG = "#69AB7C";

export default function DollarsClaimNotificationCard({
  claimantName,
  claimDescription,
  avatarUri,
  onChatPress,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarRing}>
        <Image
          style={styles.avatarImage}
          source={avatarUri ? { uri: avatarUri } : require("../../../../assets/big_logo.png")}
        />
      </View>

      <View style={styles.messageBlock}>
        <Text style={styles.messageText}>
          <Text style={styles.nameEmphasis}>{claimantName} </Text>
          <Text style={styles.messageRest}>{claimDescription}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={onChatPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Chat with claimant"
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 15,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  messageText: {
    fontSize: 13,
    color: "#000",
  },
  nameEmphasis: {
    fontWeight: "600",
  },
  messageRest: {
    fontWeight: "400",
  },
  chatButton: {
    width: 56,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: CHAT_BG,
    backgroundColor: CHAT_BG,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});
