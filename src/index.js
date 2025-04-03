// /src/index.js
import { signInUser } from './Firebase/auth.js';
import { uploadSong, upvoteSong } from './Firebase/playlist.js';

async function demo() {
  try {
    // Replace with your test credentials
    const email = "test@gmail.com";
    const password = "123456";

    // Sign in the user
    const user = await signInUser(email, password);

    // Upload a new song and get its document ID
    const songId = await uploadSong(user, "Demo Song", "Demo Artist");

    // Simulate an upvote (e.g., when a user clicks the up arrow)
    await upvoteSong(user, songId);
  } catch (error) {
    console.error("Error in demo:", error);
  }
}

demo();