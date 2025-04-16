// /src/App.jsx
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { auth } from './Firebase/firebaseConfig';
import Dashboard from './components/Dashboard';
import SignUpOrIn from './components/SignUpOrIn';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Optionally, you can merge the profile data here if needed
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  // If there is no user, show the login/signup page.
  if (!user) {
    return <SignUpOrIn onAuthSuccess={setUser} />;
  }

  // If there is a user, show the dashboard.
  return <Dashboard user={user} />;
}

export default App;