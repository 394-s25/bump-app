import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
  const [status, setStatus] = useState('Processing Spotify authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // For Implicit Grant flow, token is in the URL hash fragment
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const expiresIn = hashParams.get('expires_in');
        const error = hashParams.get('error');

        if (error) {
          setStatus(`Authentication failed: ${error}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!accessToken) {
          setStatus('No access token found');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Store token in localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        localStorage.setItem('spotify_token_expiry', Date.now() + (parseInt(expiresIn) * 1000));
        
        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus('No authentication data found');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Spotify Authentication</h1>
        <p className="text-gray-700">{status}</p>
      </div>
    </div>
  );
};

export default SpotifyCallback;