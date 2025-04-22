import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { auth } from './Firebase/firebaseConfig';
import { getUserProfile } from './Firebase/user'; // helper to pull username
import Dashboard from './components/Dashboard';
import HeaderBar from './components/HeaderBar';
import Profile from './components/Profile';
import SignUpOrIn from './components/SignUpOrIn';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // persist session & enrich with Firestore profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          setUser({ ...fbUser, ...profile });
        } catch {
          setUser(fbUser);          // fallback if no profile
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <BrowserRouter>
      <HeaderBar user={user} onLogout={() => setUser(null)} />

      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={!user ? <SignUpOrIn onAuthSuccess={setUser} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;