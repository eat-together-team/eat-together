import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Layout } from "../../../rapi_ui_components";
import { Ionicons } from "@expo/vector-icons";

const ACTIVE_POST = {
  id: "active-1",
  type: "REQUEST",
  age: "3d",
  priceText: "$15-$25",
  dateText: "11/7",
  locationText: "HUB, Cultivate, Local Point, Center Table +3",
  paymentMethods: ["Z", "V", "$"],
};

const PAYMENT_STYLE = {
  Z: { backgroundColor: "#5B2BD3" },
  V: { backgroundColor: "#2D8CFF" },
  $: { backgroundColor: "#19C85B" },
};

export default function DollarsActivePosts({ navigation }) {
  return (
    <Layout style={styles.layout}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>My active posts</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.priceText}>{ACTIVE_POST.priceText}</Text>

            <View style={styles.typeGroup}>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{ACTIVE_POST.type}</Text>
              </View>
              <Text style={styles.ageText}>{ACTIVE_POST.age}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color="#8A8A8A" />
            <Text style={styles.detailText}>{ACTIVE_POST.dateText}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#8A8A8A" />
            <Text style={styles.detailText} numberOfLines={1}>
              {ACTIVE_POST.locationText}
            </Text>
          </View>

          <View style={styles.paymentRow}>
            {ACTIVE_POST.paymentMethods.map((method) => (
              <View key={method} style={[styles.paymentBadge, PAYMENT_STYLE[method]]}>
                <Text style={styles.paymentBadgeText}>{method}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.manageButton} onPress={() => navigation.navigate("DollarsManagePost")}>
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: "#fff",
  },
  backButton: {
    width: 28,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 18,
    color: "#111",
    fontWeight: "600",
  },
  topBarSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 24,
    paddingTop: 170,
  },
  card: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 7,
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  typePill: {
    height: 16,
    borderRadius: 5,
    backgroundColor: "#E6E6E6",
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  typePillText: {
    fontSize: 8,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "600",
  },
  ageText: {
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
  },
  priceText: {
    fontSize: 30 / 2,
    color: "#111",
    fontWeight: "500",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 10,
    color: "rgba(0,0,0,0.5)",
    flexShrink: 1,
  },
  paymentRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  paymentBadge: {
    width: 25,
    height: 25,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  paymentBadgeText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  manageButton: {
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#BEBEBE",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  manageButtonText: {
    color: "#BEBEBE",
    fontSize: 20 / 1.6,
    fontWeight: "600",
  },
});
