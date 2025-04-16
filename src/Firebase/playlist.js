import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from './firebaseConfig.js';

/**
 * Creates a new playlist in the top-level "playlists" collection.
 * 
 * @param {string} ownerId - The ID of the user creating the playlist.
 * @param {string} name - The name of the playlist.
 * @param {boolean} [isPublic=false] - Whether the playlist is public.
 * @param {Array} [sharedWith=[]] - An array of user IDs that have access to this playlist.
 * @returns {Promise<string>} - The ID of the newly created playlist.
 */
export async function createPlaylist(ownerId, name, isPublic = false, sharedWith = []) {
  try {
    const playlistData = {
      ownerId,
      name,
      isPublic,
      sharedWith,
      createdAt: serverTimestamp()
    };
    const playlistRef = await addDoc(collection(db, "playlists"), playlistData);
    console.log("Playlist created with ID:", playlistRef.id);
    return playlistRef.id;
  } catch (error) {
    console.error("Error creating playlist:", error);
    throw error;
  }
}

/**
 * Fetch playlists for a given user.
 * Now retrieves playlists from the top-level "playlists" collection where the ownerId matches the provided userId.
 * 
 * @param {string} userId - The user ID to filter playlists by.
 * @returns {Promise<Array>} - An array of playlist objects.
 */
export async function getUserPlaylists(userId) {
  const playlists = [];
  const q = query(collection(db, "playlists"), where("ownerId", "==", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    playlists.push({ id: docSnap.id, ...docSnap.data() });
  });
  return playlists;
}

/**
 * Fetches all public playlists.
 * 
 * @returns {Promise<Array>} - An array of public playlist objects.
 */
export async function getPublicPlaylists() {
  const playlists = [];
  const q = query(collection(db, "playlists"), where("isPublic", "==", true));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    playlists.push({ id: docSnap.id, ...docSnap.data() });
  });
  return playlists;
}
/**
 * Fetch songs for a specific playlist.
 * Now assumes songs are stored under "playlists/{playlistId}/songs".
 * 
 * @param {string} playlistId - The ID of the playlist.
 * @returns {Promise<Array>} - An array of song objects.
 */
export async function getSongsForPlaylist(playlistId) {
  const songs = [];
  const querySnapshot = await getDocs(collection(db, "playlists", playlistId, "songs"));
  querySnapshot.forEach((docSnap) => {
    songs.push({ id: docSnap.id, ...docSnap.data() });
  });
  return songs;
}

/**
 * Uploads a new song to a specific playlist.
 * Now writes to the "playlists/{playlistId}/songs" subcollection.
 * 
 * @param {string} playlistId - The ID of the playlist.
 * @param {string} artist - The artist name.
 * @param {string} image - The image URL.
 * @param {string} songTitle - The title of the song.
 * @param {string} [user='default'] - The name of the user adding the song.
 * @returns {Promise<string>} - The ID of the newly added song document.
 */
export async function uploadSong(playlistId, artist, image, songTitle, user = "default") {
  try {
    const docRef = await addDoc(
      collection(db, "playlists", playlistId, "songs"),
      {
        artist,
        image,
        songTitle,
        user,
        timestamp: serverTimestamp(),
        votes: 0
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
 * Now works with songs in "playlists/{playlistId}/songs".
 * 
 * @param {string} playlistId - The ID of the playlist.
 * @param {string} songDocId - The ID of the song document.
 */
export async function upvoteSong(playlistId, songDocId) {
  const songRef = doc(db, "playlists", playlistId, "songs", songDocId);
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
 * Now works with songs in "playlists/{playlistId}/songs".
 * 
 * @param {string} playlistId - The ID of the playlist.
 * @param {string} songDocId - The ID of the song document.
 */
export async function downvoteSong(playlistId, songDocId) {
  const songRef = doc(db, "playlists", playlistId, "songs", songDocId);
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
 * If the user cancels an upvote, it decrements the votes by 1;
 * if the user cancels a downvote, it increments the votes by 1.
 * Now works with songs in "playlists/{playlistId}/songs".
 * 
 * @param {string} playlistId - The ID of the playlist.
 * @param {string} songDocId - The ID of the song document.
 * @param {string} voteType - Either 'upvote' or 'downvote'.
 */
export async function cancelVoteSong(playlistId, songDocId, voteType) {
  try {
    const songRef = doc(db, "playlists", playlistId, "songs", songDocId);
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