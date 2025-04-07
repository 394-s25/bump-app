// Import only what you need from Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDGbfrw5GOpCQkGUX6FnmUSVDQ7SQ6Ghs",
  authDomain: "bump-8dc73.firebaseapp.com",
  projectId: "bump-8dc73",
  storageBucket: "bump-8dc73.firebasestorage.app",
  messagingSenderId: "811675655844",
  appId: "1:811675655844:web:724afd0525fac0e4d21031",
  measurementId: "G-N8GFR0447M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function signInUserAndAddSong() {
  try {
    // Sign in with email and password
    const email = "test@gmail.com";
    const password = "123456";
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in successfully:", user.uid, user.email);
    
    // Add the song under the authenticated user's playlist collection
    await addDoc(collection(db, "users", user.uid, "playlist"), {
      songTitle: "Example Song",
      artist: "Artist Name",
      votes: 0,
      timestamp: serverTimestamp()
    });
    console.log("Song added successfully under user's playlist");
  } catch (error) {
    console.error("Error during sign in or adding song:", error);
  }
}

signInUserAndAddSong();