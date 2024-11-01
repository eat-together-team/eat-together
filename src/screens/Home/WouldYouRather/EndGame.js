import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Layout } from "react-native-rapi-ui";
import MediumText from "../../../components/MediumText";

const EndGame = ({ navigation }) => {
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.headerText}>Eat Together</Text>
        <Image source={require("../../../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.subHeaderText}>Would You Rather Game</Text>
        <Text style={styles.thankYouText}>Thank you for playing!</Text>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={() => navigation.navigate("Home")}
        >
          <MediumText style={styles.playAgainButtonText}>Play Again</MediumText>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => navigation.navigate("Home")}
        >
          <MediumText style={styles.exitButtonText}>Exit Game</MediumText>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

// styles that I got from teh figma design, will most likely need changing later
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerText: {
    color: "#579960",
    fontFamily: "Inter",
    fontSize: 26,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  subHeaderText: {
    color: "#579960",
    fontFamily: "Inter",
    fontSize: 20,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    textAlign: "center",
    marginBottom: 10,
  },
  thankYouText: {
    color: "#579960",
    fontFamily: "Inter",
    fontSize: 20,
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    textAlign: "center",
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: "#5DB075",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  playAgainButtonText: {
    color: "white",
    fontSize: 18,
  },
  exitButton: {
    backgroundColor: "white",
    borderColor: "#5DB075",
    borderWidth: 2,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  exitButtonText: {
    color: "#5DB075",
    fontSize: 18,
  },
});

export default EndGame;