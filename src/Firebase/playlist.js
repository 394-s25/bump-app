import {
  addDoc,
  collection,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

/**
 * Fetch playlists for a given user.
 * Assumes playlists are stored under "users/{userId}/playlist".
 */
export async function getUserPlaylists(userId) {
  const playlists = [];
  const querySnapshot = await getDocs(collection(db, "users", userId, "playlist"));
  querySnapshot.forEach((docSnap) => {
    playlists.push({ id: docSnap.id, ...docSnap.data() });
  });
  return playlists;
}

/**
 * Fetch songs for a specific playlist.
 * Assumes songs are stored under "users/{userId}/playlist/{playlistId}/songs".
 */
export async function getSongsForPlaylist(userId, playlistId) {
  const songs = [];
  const querySnapshot = await getDocs(collection(db, "users", userId, "playlist", playlistId, "songs"));
  querySnapshot.forEach((docSnap) => {
    songs.push({ id: docSnap.id, ...docSnap.data() });
  });
  return songs;
}

/**
 * Uploads a new song to a specific playlist.
 * Since addDoc creates a new document in an atomic manner, a transaction is not required here.
 */
export async function uploadSong(userId, playlistId, songTitle, artist) {
  try {
    const docRef = await addDoc(
      collection(db, "users", userId, "playlist", playlistId, "songs"),
      {
        songTitle,
        artist,
        votes: 0,
        timestamp: serverTimestamp()
      }
    );
    console.log("Song added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error uploading song:", error);
    throw error;
  }
}

/**
 * Increments the vote count for a song by 1 using a transaction.
 */
export async function upvoteSong(userId, playlistId, songDocId) {
  const songRef = doc(db, "users", userId, "playlist", playlistId, "songs", songDocId);
  try {
    await runTransaction(db, async (transaction) => {
      const songDoc = await transaction.get(songRef);
      if (!songDoc.exists()) {
        throw new Error("Song does not exist!");
      }
      const currentVotes = songDoc.data().votes || 0;
      transaction.update(songRef, { votes: currentVotes + 1 });
    });
    console.log("Song upvoted using transaction.");
  } catch (error) {
    console.error("Error upvoting song with transaction:", error);
    throw error;
  }
}

/**
 * Decrements the vote count for a song by 1 using a transaction.
 */
export async function downvoteSong(userId, playlistId, songDocId) {
  const songRef = doc(db, "users", userId, "playlist", playlistId, "songs", songDocId);
  try {
    await runTransaction(db, async (transaction) => {
      const songDoc = await transaction.get(songRef);
      if (!songDoc.exists()) {
        throw new Error("Song does not exist!");
      }
      const currentVotes = songDoc.data().votes || 0;
      transaction.update(songRef, { votes: currentVotes - 1 });
    });
    console.log("Song downvoted using transaction.");
  } catch (error) {
    console.error("Error downvoting song with transaction:", error);
    throw error;
  }
}

/**
 * Cancels a vote for a song.
 * If the user cancels an upvote, it will decrement the votes by 1;
 * if the user cancels a downvote, it will increment the votes by 1.
 * You could also refactor this to use a transaction if you need to ensure consistency
 * in a more complex flow.
 *
 * @param {string} userId - The user ID.
 * @param {string} playlistId - The playlist ID.
 * @param {string} songDocId - The song document ID.
 * @param {string} voteType - Either 'upvote' or 'downvote'.
 */
export async function cancelVoteSong(userId, playlistId, songDocId, voteType) {
  // For simplicity, this function still uses the atomic update with increment.
  // It can be refactored to use a transaction if you need additional reads.
  try {
    const songRef = doc(db, "users", userId, "playlist", playlistId, "songs", songDocId);
    const adjustment = voteType === 'upvote' ? -1 : (voteType === 'downvote' ? 1 : 0);
    if (adjustment !== 0) {
      await runTransaction(db, async (transaction) => {
        const songDoc = await transaction.get(songRef);
        if (!songDoc.exists()) {
          throw new Error("Song does not exist!");
        }
        const currentVotes = songDoc.data().votes || 0;
        transaction.update(songRef, { votes: currentVotes + adjustment });
      });
      console.log("Vote cancelled using transaction.");
    }
  } catch (error) {
    console.error("Error cancelling vote with transaction:", error);
    throw error;
  }
}