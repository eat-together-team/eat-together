import React from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";

import MediumText from "./MediumText";

const { width } = Dimensions.get("window");

const FunFact = ({ text }) => {
  if (!text || text.trim() === "") return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/quote.png")}
          style={[styles.quote, styles.quoteClose]}
        />
        <Image
          source={require("../../assets/quote.png")}
          style={[styles.quote, styles.quoteOpen]}
        />

        <View style={styles.textWrapper}>
          <MediumText center>{text}</MediumText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  card: {
    width: width * 0.9,
    minHeight: 120,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "center",
  },
  quote: {
    position: "absolute",
    width: 36,
    height: 36,
    resizeMode: "contain",
    tintColor: "#b2b2b2",
  },
  quoteOpen: {
    top: 10,
    left: 10,
  },
  quoteClose: {
    bottom: 10,
    right: 10,
    transform: [{ rotate: "180deg" }],
  },
  textWrapper: {
    paddingHorizontal: 26,
    maxWidth: "85%",
    alignSelf: "center",
  },
});

export default FunFact;

