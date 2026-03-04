//Users go here if they forget their password

import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import * as firebase from "firebase/compat";

import {
  Layout,
} from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";

import TextInput from "../../components/TextInput";
import Button from "../../components/Button";
import LargeText from "../../components/LargeText";
import NormalText from "../../components/NormalText";

export default function ({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function forget() {
    setLoading(true);
    await firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(function () {
        setLoading(false);
        navigation.navigate("Login");
        alert("Your password reset has been sent to your email");
      })
      .catch(function (error) {
        setLoading(false);
        alert(error);
      });
  }
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: 220,
                width: 220,
              }}
              source={require("../../../assets/gathering.png")}
            />
          </View>
          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: "white",
            }}
          >
            <LargeText center>Reset Password</LargeText>
            <TextInput
              width="100%"
              height={40}
              iconLeft="mail"
              marginTop={15}
              placeholder="Enter your email"
              value={email}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(newEmail) => setEmail(newEmail)}
            />
            <Button onPress={forget} disabled={loading} marginVertical={10}>
              {loading ? "Loading" : "Send email"}
            </Button>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 15,
                justifyContent: "center",
              }}
            >
              <NormalText>Remember your password? </NormalText>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Login");
                }}
              >
                <NormalText center color="#5DB075">Go back</NormalText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
}
