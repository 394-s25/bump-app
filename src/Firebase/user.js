import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

/**
 * Creates or updates a user profile in the 'users' collection.
 *
 * @param {string} userId - The Firebase Auth user ID.
 * @param {string} email - The user's email address.
 * @param {string} [username='New User'] - The user's display name.
 * @param {Array} [friends=[]] - An array of friend user IDs.
 * @returns {Promise<void>}
 */
export async function createUserProfile(userId, email, username = 'New User', friends = []) {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        email,
        username,
        friends,
        createdAt: serverTimestamp()
      },
      { merge: true }
    );
    console.log('User profile created for user:', userId);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Fetches the user profile document from Firestore.
 *
 * @param {string} userId - The Firebase Auth user ID.
 * @returns {Promise<Object>} - The user profile data.
 */
export async function getUserProfile(userId) {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('User profile does not exist');
    }
  }