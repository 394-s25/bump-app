import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { auth } from './Firebase/firebaseConfig';
import { getUserProfile } from './Firebase/user';
import Dashboard from './components/Dashboard';
import HeaderBar from './components/HeaderBar';
import Profile from './components/Profile';
import SignUpOrIn from './components/SignUpOrIn';
import SpotifyCallback from './components/SpotifyCallback';

// Create a separate component that will be used inside the Router context
// Add console logs for debugging and improve the auth handler

// Update AuthHandlerWithRouter to handle token from hash fragment instead of code
const AuthHandlerWithRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a code in the query params
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    // If this is the root path and we have a code with the right state
    if (code && state === 'spotify_auth_callback') {
      console.log("Processing Spotify auth code");
      
      // Exchange code for token using your Flask API
      fetch('http://127.0.0.1:5000/spotify-auth', {  // Changed URL to local server
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ code, redirect_uri: "http://127.0.0.1:5173/" })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to exchange code for token: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Got token from API, storing in localStorage");
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', Date.now() + (parseInt(data.expires_in) * 1000));
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, location.pathname);
        
        // Trigger a manual event to ensure Dashboard picks up the change
        window.dispatchEvent(new Event('storage'));
        
        alert('Successfully connected to Spotify!');
      })
      .catch(error => {
        console.error('Error exchanging code for token:', error);
        alert('Failed to connect to Spotify: ' + error.message);
      });
    }
  }, [location, navigate]);

  return children;
};

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
      {/* Use Routes first, then AuthHandlerWithRouter inside */}
      <Routes>
        <Route
          path="/"
          element={
            <AuthHandlerWithRouter>
              {user ? (
                <>
                  <HeaderBar user={user} onLogout={() => setUser(null)} />
                  <Dashboard user={user} />
                </>
              ) : (
                <Navigate to="/login" replace />
              )}
            </AuthHandlerWithRouter>
          }
        />
        <Route
          path="/login"
          element={!user ? <SignUpOrIn onAuthSuccess={setUser} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={
            user ? (
              <>
                <HeaderBar user={user} onLogout={() => setUser(null)} />
                <Profile user={user} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/spotify-callback" 
          element={<SpotifyCallback />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;