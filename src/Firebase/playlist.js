// /src/Firebase/playlist.js
import { addDoc, collection, doc, getDocs, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';

/**
 * Fetch playlists for a given user.
 * Assumes playlists are stored under "users/{userId}/playlists".
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
 * Assumes songs are stored under "users/{userId}/playlists/{playlistId}/songs".
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
 * Increments the vote count for a song by 1.
 */
export async function upvoteSong(userId, playlistId, songDocId) {
  try {
    const songRef = doc(db, "users", userId, "playlist", playlistId, "songs", songDocId);
    await updateDoc(songRef, { votes: increment(1) });
    console.log("Song upvoted.");
  } catch (error) {
    console.error("Error upvoting song:", error);
    throw error;
  }
}

/**
 * Decrements the vote count for a song by 1.
 */
export async function downvoteSong(userId, playlistId, songDocId) {
  try {
    const songRef = doc(db, "users", userId, "playlist", playlistId, "songs", songDocId);
    await updateDoc(songRef, { votes: increment(-1) });
    console.log("Song downvoted.");
  } catch (error) {
    console.error("Error downvoting song:", error);
    throw error;
  }
}