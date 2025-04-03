// /src/Firebase/playlist.js
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

/**
 * Uploads a new song to the authenticated user's playlist.
 * @param {object} user - The authenticated user.
 * @param {string} songTitle - The title of the song.
 * @param {string} artist - The artist name.
 * @returns {Promise<string>} - A promise that resolves with the document ID of the added song.
 */
export async function uploadSong(user, songTitle, artist) {
  try {
    const docRef = await addDoc(collection(db, "users", user.uid, "playlist"), {
      songTitle,
      artist,
      votes: 0,
      timestamp: serverTimestamp()
    });
    console.log("Song added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error uploading song:", error);
    throw error;
  }
}

/**
 * Upvotes a song by incrementing its vote count.
 * @param {object} user - The authenticated user.
 * @param {string} songDocId - The document ID of the song.
 * @returns {Promise<void>}
 */
export async function upvoteSong(user, songDocId) {
  try {
    const songRef = doc(db, "users", user.uid, "playlist", songDocId);
    await updateDoc(songRef, {
      votes: increment(1)
    });
    console.log("Song upvoted successfully");
  } catch (error) {
    console.error("Error upvoting song:", error);
    throw error;
  }
}