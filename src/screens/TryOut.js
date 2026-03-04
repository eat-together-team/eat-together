// Display your events

import React from "react";
import { 
  ScrollView,
  View,
  KeyboardAvoidingView
} from "react-native";
import firebase from "firebase/compat";
import { Layout } from "react-native-rapi-ui";

import Button from "../components/Button";
import LargeText from "../components/LargeText";

export default function () {
  async function signOut () {
    await firebase.auth().signOut();
  }
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
            <LargeText center>Done Exploring the App?</LargeText>
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
              signOut();
            }} marginVertical={10} backgroundColor="white" color="#5DB075">
              Create an account!
            </Button>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
    </Layout>
  );
}


