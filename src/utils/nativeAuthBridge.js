import { Platform } from "react-native";

// Lazily required, Android-only: this package is excluded from iOS
// autolinking entirely, so a static top-level import would try to reach the
// native module at import time on iOS too and crash with "Native module
// RNFBAppModule not found" before Platform.OS is ever checked.
const nativeAuth = () =>
  require("@react-native-firebase/auth").default();

// Android-only. @react-native-firebase/storage doesn't share a session with
// the JS Firebase SDK this app actually authenticates through
// (firebase/compat) — they're two separate native/JS SDK stacks that don't
// automatically bridge. Without this, native Storage always sees
// request.auth as null (hence "storage/unauthorized" on every upload) even
// though the JS SDK considers the user signed in. Mirroring sign-in/up/out
// here on the native SDK too is what lets Storage's security rules see a
// valid request.auth.
//
// iOS doesn't use @react-native-firebase/storage at all (its upload path
// stays on firebase/compat, which never had Android's upload-hang problem),
// so it has no need for this bridge either — @react-native-firebase/auth is
// excluded from iOS autolinking entirely (see package.json), so calling
// nativeAuth() there would throw ("native module not found").
//
// This is best-effort and intentionally swallows its own errors — the JS
// SDK stays the app's real source of truth for auth state; if this bridge
// fails, the user is still signed in as far as the rest of the app is
// concerned, they'd just hit the same storage/unauthorized error on
// Android uploads.

export const bridgeSignIn = async (email, password) => {
  if (Platform.OS !== "android") return;
  try {
    await nativeAuth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error("Native auth sign-in bridge failed:", error);
  }
};

export const bridgeSignUp = async (email, password) => {
  if (Platform.OS !== "android") return;
  try {
    await nativeAuth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    console.error("Native auth sign-up bridge failed:", error);
  }
};

export const bridgeSignOut = async () => {
  if (Platform.OS !== "android") return;
  try {
    await nativeAuth().signOut();
  } catch (error) {
    console.error("Native auth sign-out bridge failed:", error);
  }
};
