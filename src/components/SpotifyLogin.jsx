import React from 'react';
import { FaSpotify } from 'react-icons/fa';

// Your Spotify app credentials - Client ID can be public, Client Secret should never be here
const CLIENT_ID = "4f8f98b0dd534355bee6085dbcaf284f";

// Dynamically determine the correct redirect URI based on the environment
const REDIRECT_URI = window.location.hostname === 'bump-8dc73.web.app' 
  ? 'https://bump-8dc73.web.app/' 
  : 'http://127.0.0.1:5173/';

// Also determine the API URL based on environment
const API_URL = window.location.hostname === 'bump-8dc73.web.app'
  ? 'https://bump-app-416502417253.us-central1.run.app/' // Replace with your Cloud Run URL after deploying
  : 'http://127.0.0.1:5000';

const SpotifyLogin = ({ onLogin }) => {
  const handleLoginClick = () => {
    // Define the permissions we need
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-modify-playback-state',
      'user-read-playback-state'
    ];

    // Build the authorization URL manually
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    
    // Add query parameters
    authUrl.searchParams.append("client_id", CLIENT_ID);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    
    // Add state parameter to identify this is an auth callback
    authUrl.searchParams.append("state", "spotify_auth_callback");
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("show_dialog", "true");
    
    console.log("Auth URL:", authUrl.toString());
    
    // Redirect to Spotify's authorization page
    window.location.href = authUrl.toString();
  };

  return (
    <button
      onClick={handleLoginClick}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
    >
      <FaSpotify size={20} />
      Connect Spotify
    </button>
  );
};

export default SpotifyLogin;