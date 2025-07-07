import { useEffect, useRef } from "react";
import { Alert, Linking, Platform, AppState } from "react-native";
import { db } from '../provider/Firebase';
import firebase from "firebase/compat";

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import DeviceToken from './DeviceToken';
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Sends a push notification using Expo's push notification service.
 * @param {string} expoPushToken - The Expo push token to send the notification to.
 */
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

/**
 * Handles errors during push notification registration.
 * @param {string} errorMessage - The error message to display.
 *
 */
function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

/**
 * Registers the device for push notifications and retrieves the Expo push token.
 * @async
 * @returns {Promise<string>} - Returns a promise that resolves to the Expo push token string.
 * @throws Will throw an error if the device is not a physical device or if the project
 */
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        "Push Notification Disabled",
        "Push notifications for Eat Together have been disabled in Settings. Would you like to open settings and enable them now?",
        [
          {
            text: "Yes",
            onPress:() => {
                Linking.openSettings();
            },
            style: "cancel"
          },
          {
            text: "No",
            onPress: () => {}
          }
        ]
      );
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

/**
 * Custom hook to sync notification settings with Firebase when app state changes.
 * @param {*} userId - The ID of the user to sync notifications for.
 * @returns {Object} - An object containing the syncNotificationSettings function.
 */
const useNotificationSync = (userId) => {
  const appState = useRef(AppState.currentState);
  const lastCheck = useRef(0);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      const now = Date.now();
      
      // Debounce - only check once per few seconds
      if (appState.current.match(/inactive|background/) && 
          nextAppState === 'active' &&
          now - lastCheck.current > 3000) {
        
        lastCheck.current = now;
        await syncNotificationSettings(userId);
      }
      appState.current = nextAppState;
    };

    // Set up listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Initial sync on mount
    syncNotificationSettings(userId);

    return () => subscription?.remove();
  }, [userId]);

  // Function to sync notification settings with Firebase
  const syncNotificationSettings = async (userId) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const previousStatus = await AsyncStorage.getItem(`notif_status_${userId}`);
      
      // Only update if status actually changed
      if (status !== previousStatus) {
        await AsyncStorage.setItem(`notif_status_${userId}`, status);

        // If notifications are now enabled, get fresh token
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          DeviceToken.setToken(token.data);

          await db
            .collection("Users")
            .doc(userId)
            .update({
              pushTokens: firebase.firestore.FieldValue.arrayUnion(token.data)
            });
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return { syncNotificationSettings };
};

export {
  sendPushNotification,
  registerForPushNotificationsAsync,
  handleRegistrationError,
  useNotificationSync
}