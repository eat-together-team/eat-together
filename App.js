import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/provider/AuthProvider";
import { ThemeProvider } from "react-native-rapi-ui";
import { MenuProvider } from "react-native-popup-menu";
import { LogBox } from "react-native";

export default function App() {
  LogBox.ignoreAllLogs(); //DISABLE THOSE STUPID WARNINGS SLAYYYYY

  // Only uncomment if you do not want error info in terminal
  // console.warn = function () {};
  // console.error = function () {};

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
