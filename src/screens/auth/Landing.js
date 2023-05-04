// Landing page for the app. This is the first page that the user sees when they open the app.

import React from "react";
import firebase from "firebase/compat";
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  Image,
  TouchableOpacity
} from "react-native";

import {
  Layout,
} from "react-native-rapi-ui";

import Button from "../../components/Button";
import LargeText from "../../components/LargeText";
import MediumText from "../../components/MediumText";

async function loginTryOut() {
  await firebase.auth().signInWithEmailAndPassword('calebcile@gmail.com', 'tryout123');
}

export default function ({ navigation }) {
  return (
  <Layout>
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
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
                height: 250,
                width: 250,
              }}
              source={require("../../../assets/welcome.png")}
            />
            <LargeText center>Connecting students through shared meals.</LargeText>
          </View>

          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: "white",
            }}
          >
            <Button onPress={() => {
              navigation.navigate("Name");
            }} marginVertical={10}>
              Sign Up
            </Button>

            <Button onPress={() => {
              navigation.navigate("Login");
            }} marginVertical={10} backgroundColor="white" color="#5DB075">
              Login
            </Button>

            <TouchableOpacity onPress={loginTryOut} style={{ marginTop: 20 }}>
              <MediumText center color="grey">Explore as a guest!</MediumText>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  </Layout>
  );
}
