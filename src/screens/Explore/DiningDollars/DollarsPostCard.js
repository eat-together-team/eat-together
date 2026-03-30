import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "../../../rapi_ui_components";
import { DOLLARS_PAYMENT_BADGE_STYLE } from "./dollarsConstants";

export default function DollarsPostCard({
  post,
  buttonLabel,
  onPressButton,
  buttonDisabled = false,
  wrapLocations = false,
}) {
  return (
    <View style={styles.postCard}>
      <View style={styles.postTopRow}>
        <View style={styles.authorRow}>
          {post.ownerPhotoUrl ? (
            <Avatar source={{ uri: post.ownerPhotoUrl }} size="sm" />
          ) : (
            <Avatar source={require("../../../../assets/big_logo.png")} size="sm" />
          )}
          <Text style={styles.authorText}>
            {post.author} {"\u2022"} {post.age}
          </Text>
        </View>

        <View style={styles.typePill}>
          <Text style={styles.typePillText}>{post.type}</Text>
        </View>
      </View>

      <Text style={styles.priceText}>{post.priceText}</Text>

      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={14} color="#8A8A8A" />
        <Text style={styles.detailText}>{post.dateText}</Text>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="location-outline" size={14} color="#8A8A8A" />
        <Text style={styles.detailText} numberOfLines={wrapLocations ? undefined : 1}>
          {post.locationText}
        </Text>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.paymentRow}>
          {(post.paymentMethods || []).map((method) => (
            <View key={`${post.id}-${method}`} style={[styles.paymentBadge, DOLLARS_PAYMENT_BADGE_STYLE[method]]}>
              <Text style={styles.paymentBadgeText}>{method}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          disabled={buttonDisabled}
          onPress={buttonDisabled ? undefined : onPressButton}
        >
          <Text style={styles.actionButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 7,
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  postTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorText: {
    marginLeft: 6,
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
  },
  typePill: {
    height: 16,
    borderRadius: 5,
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  typePillText: {
    fontSize: 8,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 28 / 1.85,
    color: "#111",
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 7,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  cardBottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  paymentBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  actionButton: {
    width: 63,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#BEBEBE",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#BEBEBE",
    fontSize: 12,
    fontWeight: "600",
  },
});

