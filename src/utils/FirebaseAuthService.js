import firebase from "firebase/compat";
import { auth } from "../provider/Firebase";

async function signInWithEmailPassword(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
}

export { signInWithEmailPassword };
