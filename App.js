import React, { useEffect } from "react";
import { enableScreens, enableFreeze } from "react-native-screens";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/provider/AuthProvider";
import { ThemeProvider } from "./src/rapi_ui_components";
import { MenuProvider } from "react-native-popup-menu";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Network from 'expo-network';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import 'react-native-reanimated';
configureReanimatedLogger({
  level: ReanimatedLogLevel.error, // or ReanimatedLogLevel.none if available
  strict: false
});

// Without this, react-navigation renders every screen as a plain JS-managed
// View instead of a native Screen, which is what was actually making
// transitions feel janky no matter how the animation itself was tuned.
// enableFreeze pauses off-screen screens' own work (renders/effects) during
// a transition instead of letting them keep running underneath it.
enableScreens();
enableFreeze(true);
export default function App() {
  LogBox.ignoreAllLogs(); // Disables annoying warning in terminal, feel free to uncomment if needed

  // Only uncomment if you do not want error info in terminal
  // console.warn = function () {};
  // console.error = function () {};

  // Check for internet connection status
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MenuProvider>
        <ThemeProvider images={images}>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </MenuProvider>
    </GestureHandlerRootView>
  );
}
