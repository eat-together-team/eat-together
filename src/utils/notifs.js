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
 * Handles errors during push notification registration.
 * @param {string} errorMessage - The error message to display.
 *
 */
function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw new Error(errorMessage);
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

  /**
   * Syncs notification settings with Firebase and requests permissions if needed.
   * @param {*} userId - The ID of the user to sync notifications for.
   */
  const syncNotificationSettings = async (userId) => {
    if (Device.isDevice) { // Check if the device is a physical device
      try {
        // Check current notification permissions
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;

        // Fetch the current notification status
        const previousStatus = await AsyncStorage.getItem(`notif_status_${userId}`);

        // Only run if status actually changed
        if (status !== previousStatus) {
          if (finalStatus !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync(); // Request permissions if not already granted
            finalStatus = newStatus;
          }

          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? "605daf62-9a09-4742-8204-1f8dfb5e4363";

          if (!projectId) {
            handleRegistrationError('Project ID not found');
          }
        
          await AsyncStorage.setItem(`notif_status_${userId}`, finalStatus);

          // If notifications are now enabled, get fresh token
          if (finalStatus === 'granted') {
            const token = (
              await Notifications.getExpoPushTokenAsync({
                projectId,
              })
            ).data;
            DeviceToken.setToken(token);

            await db
              .collection("Users")
              .doc(userId)
              .update({
                pushTokens: firebase.firestore.FieldValue.arrayUnion(token)
              });
          }
        }
      } catch (e) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  };

  return { syncNotificationSettings };
};

export {
  useNotificationSync
}