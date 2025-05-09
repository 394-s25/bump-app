import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
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

export async function getSharedPlaylists(userId) {
  const playlists = [];
  const q = query(collection(db, "playlists"), where("sharedWith", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(docSnap => {
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
 * @param {string} [spotifyUri=null] - The Spotify URI for playback.
 * @returns {Promise<string>} - The ID of the newly added song document.
 */
export async function uploadSong(playlistId, artist, image, songTitle, user = "default", spotifyUri = null) {
  try {
    const docRef = await addDoc(
      collection(db, "playlists", playlistId, "songs"),
      {
        artist,
        image,
        songTitle,
        user,
        timestamp: serverTimestamp(),
        votes: 0,
        spotifyUri // Add the Spotify URI for playback
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

/**
 * Returns the number of songs in a playlist.
 *
 * @param {string} playlistId - The playlist ID.
 * @returns {Promise<number>} - Total songs in the playlist.
 */
export async function countSongsInPlaylist(playlistId) {
  const snapshot = await getDocs(collection(db, "playlists", playlistId, "songs"));
  return snapshot.size;
}

/**
 * Builds a map of { playlistId: { name, count } } for every playlist the user owns.
 *
 * @param {string} userId - Owner's UID.
 * @returns {Promise<Object>} - Counts keyed by playlist ID.
 */
export async function getSongCountsForUser(userId) {
  const playlists = await getUserPlaylists(userId);
  const result = {};
  for (const pl of playlists) {
    const size = await countSongsInPlaylist(pl.id);
    result[pl.id] = { name: pl.name, count: size };
  }
  return result;
}


// Given a username and a playlist id:
//  Search and get user id from databse
//  Then share the specified playlist with the specified user


export async function addUserToPlaylist(playlistId, username) {
  try {
    // Search within users collection 
    const usersRef = collection (db, 'users');
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    const userId = querySnapshot.docs[0].id;

    const playlistRef = doc(db, "playlists", playlistId);
    

    await updateDoc(playlistRef, {
      sharedWith: arrayUnion(userId)
    });

    console.log(`User ${username} added to playlist ${playlistId}`)
  }
  catch(error) {
    console.error("Error adding user to playlist: ", error);
    throw error;
  }
}

/**
 * Get the current playback state for a playlist
 */
export async function getPlaybackState(playlistId) {
  try {
    const playbackRef = doc(db, "playlists", playlistId, "playback_state", "current");
    const snapshot = await getDoc(playbackRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting playback state:", error);
    return null;
  }
}

/**
 * Enhanced removeSongFromPlaylist with better error logging
 */
export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    console.log(`Attempting to remove song ${songId} from playlist ${playlistId}`);
    const songRef = doc(db, "playlists", playlistId, "songs", songId);
    await deleteDoc(songRef);
    console.log(`Song ${songId} successfully removed`);
    return true;
  } catch (error) {
    console.error(`Error removing song ${songId}:`, error);
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.error("Permission denied. Check if user has rights to modify this playlist");
    }
    throw error;
  }
}