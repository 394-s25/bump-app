// /src/Firebase/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig.js';
import { createUserProfile, getUserProfile } from './user.js';

/**
 * Signs in a user with email and password and returns an enriched user object.
 */
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user.uid, user.email);
    // Fetch and merge additional user profile info.
    const userProfile = await getUserProfile(user.uid);
    return { ...user, ...userProfile };
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

/**
 * Signs up a new user with email and password, creates a corresponding user profile,
 * and returns an enriched user object.
 */
export async function signUpUser(email, password, username) {
  try {
    console.log("Signing up with username:", username);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed up:", user.uid, user.email);
    
    // Create a user profile document in the 'users' collection.
    await createUserProfile(user.uid, user.email, username, []);
    // Fetch the newly created profile.
    const userProfile = await getUserProfile(user.uid);
    return { ...user, ...userProfile };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}