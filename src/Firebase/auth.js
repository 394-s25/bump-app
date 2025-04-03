// /src/Firebase/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js';

/**
 * Signs in a user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} - A promise that resolves with the user object.
 */
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully:", userCredential.user.uid, userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

/**
 * Signs up a new user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} - A promise that resolves with the user object.
 */
export async function signUpUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up successfully:", userCredential.user.uid, userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}