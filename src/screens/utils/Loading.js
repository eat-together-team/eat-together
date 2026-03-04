import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Layout } from "../../rapi_ui_components";

export default function ({ navigation }) {
  return (
    <Layout>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* This text using ubuntu font */}
        <ActivityIndicator size="large" color={"#3366FF"} />
      </View>
    </Layout>
  );
}
