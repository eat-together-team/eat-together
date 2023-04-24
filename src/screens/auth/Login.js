//Users go here to log in

import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import {db} from "../../provider/Firebase";
import {auth} from "../../provider/Firebase";
import "firebase/firestore"
import firebase from "firebase/compat";


import {
  Layout,
} from "react-native-rapi-ui";

import Button from "../../components/Button";
import TextInput from "../../components/TextInput";
import LargeText from "../../components/LargeText";
import NormalText from "../../components/NormalText";
import DeviceToken from "../utils/DeviceToken";
import MediumText from "../../components/MediumText";

export default function ({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function login() {
    setLoading(true);
    await firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        setLoading(false);
        alert(errorMessage);
    });

    const user = auth.currentUser;

    //If this is a sign-in to a new acct from the same phone, register the device token on that new acct
    if(DeviceToken.getToken() != null) {
        await db.collection("Users").doc(user.uid).update({
            pushTokens: firebase.firestore.FieldValue.arrayUnion(DeviceToken.getToken())
        })
    }
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
            <Image
              resizeMode="contain"
              style={{
                height: 150,
                width: 150,
              }}
              source={require("../../../assets/logo.png")}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingBottom: 20,
              backgroundColor: "white",
            }}
          >
            <LargeText center>Welcome Back!</LargeText>

            <TextInput
              iconLeft="mail"
              placeholder="Enter your email"
              width="100%"
              height="10%"
              marginTop="9%"
              value={email}
              bold={true}
              onChangeText={(newEmail) => setEmail(newEmail)}
            />

            <TextInput
              iconLeft="lock-closed"
              iconRight={!showPass ? "eye" : "eye-off"}
              iconRightOnPress={() => {setShowPass(!showPass)}}
              placeholder="Enter your password"
              width="100%"
              height="10%"
              marginTop="4%"
              marginBottom="4%"
              value={password}
              bold={true}
              onChangeText={(newPassword) => setPassword(newPassword)}
              secureTextEntry={!showPass ? true : false}
            />

            <Button onPress={login} marginVertical={10} disabled={loading}>
              {loading ? "Loading" : "Login"}
            </Button>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
                justifyContent: "center",
              }}
            >
              <NormalText>Forgot password? </NormalText>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ForgetPassword");
                }}
              >
                <NormalText color="#5DB075">Click here</NormalText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                justifyContent: "center",
              }}
            >
              <NormalText>New? </NormalText>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Name");
                }}
              >
                <NormalText color="#5DB075">Create a new account</NormalText>
              </TouchableOpacity>
            </View>

            <Button onPress={() => {
              navigation.goBack();
            }} marginVertical={10} disabled={loading} backgroundColor="white" color="#5DB075">
              Exit
            </Button>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  </Layout>
  );
}
