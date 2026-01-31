import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

import MediumText from "./MediumText";

const { width } = Dimensions.get("window");

const QUOTE_PATH =
  "M0 25.8168V18.1463C0 15.9683 0.426125 13.7429 1.2784 11.4702C2.13067 9.19744 3.2552 7.05492 4.65198 5.04261C6.04876 3.03029 7.56391 1.34942 9.19743 0L15.8736 3.94176C14.5478 6.02509 13.4588 8.20312 12.6065 10.4758C11.7779 12.7486 11.3636 15.2817 11.3636 18.0753V25.8168H0ZM17.9332 25.8168V18.1463C17.9332 15.9683 18.3594 13.7429 19.2116 11.4702C20.0639 9.19744 21.1884 7.05492 22.5852 5.04261C23.982 3.03029 25.4971 1.34942 27.1307 0L33.8068 3.94176C32.4811 6.02509 31.392 8.20312 30.5398 10.4758C29.7112 12.7486 29.2969 15.2817 29.2969 18.0753V25.8168H17.9332Z";

const QuoteIcon = ({ size = 36, color = "#b2b2b2", style }) => (
  <Svg width={size} height={size} viewBox="0 0 34 26" fill="none" style={style}>
    <Path
      d={QUOTE_PATH}
      fill={color}
    />
  </Svg>
);

const FunFact = ({ text }) => {
  if (!text || text.trim() === "") return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <QuoteIcon
          size={36}
          color="#b2b2b2"
          style={[styles.quote, styles.quoteClose]}
        />
        <QuoteIcon
          size={36}
          color="#b2b2b2"
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
    resizeMode: "contain",
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

