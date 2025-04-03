// /src/Firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

export { app, auth, db };
