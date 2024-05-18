import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/provider/AuthProvider";
import { ThemeProvider } from "react-native-rapi-ui";
import { MenuProvider } from "react-native-popup-menu";
import { LogBox } from "react-native";
import * as Updates from 'expo-updates';
import * as Network from 'expo-network';
import { View, Text } from "react-native";

import 'react-native-reanimated';
import NormalText from "./src/components/NormalText";
import LargeText from "./src/components/LargeText";
import MediumText from "./src/components/MediumText";
import SmallText from "./src/components/SmallText";

export default function App() {
  LogBox.ignoreAllLogs(); //DISABLE THOSE STUPID WARNINGS SLAYYYYY

  // Only uncomment if you do not want error info in terminal
  // console.warn = function () {};
  // console.error = function () {};

  // Check for app updates
  useEffect(() => {
    async function getNetwork() {
      const hasNetwork = await Network.getNetworkStateAsync();
      if (!hasNetwork.isConnected) {
        alert("No/weak internet connection :(");
      }
    }

    getNetwork();
  }, []);

  const images = [
    require("./assets/icon.png"),
    require("./assets/splash.png"),
    require("./assets/login.png"),
    require("./assets/register.png"),
    require("./assets/forget.png")
  ];

  return (
    <MenuProvider>
      <ThemeProvider images={images}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </MenuProvider>
  );
}
