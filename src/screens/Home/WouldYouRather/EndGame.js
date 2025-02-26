import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { Layout } from "react-native-rapi-ui";
import MediumText from "../../../components/MediumText";

const EndGame = ({ navigation, route }) => {
  const { event } = route.params;

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.headerText}>Eat Together</Text>
        <Image source={require("../../../../assets/logo.png")} style={styles.logo} />
        <Text style={styles.subHeaderText}>Would You Rather Game</Text>
        <Text style={styles.thankYouText}>Thank you for playing!</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => navigation.navigate("Home")} >
          <MediumText style={styles.exitButtonText}>Exit Game</MediumText>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 32, 
    fontWeight: "bold",
    marginBottom: 20,
    color: "#5DB075",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  subHeaderText: {
    fontSize: 20, 
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  thankYouText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  exitButton: {
    backgroundColor: "#FF6347",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: "80%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  exitButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
});

export default EndGame;