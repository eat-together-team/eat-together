// Row of small brand-colored circles (Z / V / $ / C) for a post's accepted
// payment methods. Brand colors stay the same in light and dark mode.

import React from "react";
import { View, StyleSheet } from "react-native";
import LabelText from "../typography/LabelText";
import { getDollarsPaymentMethod } from "../../screens/Explore/DiningDollars/dollarsConstants";

const DollarsPaymentBadges = ({ methods = [], size = 22 }) => (
  <View style={styles.row}>
    {methods.map((id) => {
      const method = getDollarsPaymentMethod(id);
      if (!method) return null;
      return (
        <View
          key={method.id}
          style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: method.color }]}
          accessibilityLabel={method.label}
        >
          <LabelText color="#ffffff">{method.badge}</LabelText>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DollarsPaymentBadges;
