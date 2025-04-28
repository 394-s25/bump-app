// /src/API/spotify-service.js
const axios = require('axios');

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';

// Store tokens
let accessToken = null;
let refreshToken = null;
let expiryTime = null;

/**
 * Initialize Spotify authentication
 */
const initializeSpotify = (clientId, clientSecret, redirectUri) => {
  return {
    clientId,
    clientSecret,
    redirectUri
  };
};

/**
 * Get authorization URL for Spotify login
 */
const getAuthorizationUrl = (spotifyConfig, scopes = ['user-read-private', 'user-modify-playback-state', 'user-read-playback-state', 'streaming']) => {
  const scopesString = scopes.join(' ');
  return `https://accounts.spotify.com/authorize?client_id=${spotifyConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&scope=${encodeURIComponent(scopesString)}`;
};

/**
 * Exchange authorization code for tokens
 */
const exchangeCodeForToken = async (spotifyConfig, code) => {
  try {
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: spotifyConfig.redirectUri,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`).toString('base64')
        }
      }
    );
    
    accessToken = response.data.access_token;
    refreshToken = response.data.refresh_token;
    expiryTime = Date.now() + (response.data.expires_in * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Refresh access token when expired
 */
const refreshAccessToken = async (spotifyConfig) => {
  try {
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`).toString('base64')
        }
      }
    );
    
    accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      refreshToken = response.data.refresh_token;
    }
    expiryTime = Date.now() + (response.data.expires_in * 1000);
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Ensure token validity
 */
const ensureValidToken = async (spotifyConfig) => {
  if (!accessToken || Date.now() > expiryTime - 60000) {
    await refreshAccessToken(spotifyConfig);
  }
  return accessToken;
};

/**
 * Get track information
 */
const getTrack = async (spotifyConfig, trackId) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};

/**
 * Control playback - Play
 */
const play = async (spotifyConfig, deviceId = null, uri = null) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const url = deviceId 
      ? `${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}` 
      : `${SPOTIFY_API_BASE}/me/player/play`;
    
    const body = uri ? { uris: [uri] } : {};
    
    await axios.put(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error('Error starting playback:', error);
    throw error;
  }
};

/**
 * Control playback - Pause
 */
const pause = async (spotifyConfig, deviceId = null) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const url = deviceId 
      ? `${SPOTIFY_API_BASE}/me/player/pause?device_id=${deviceId}` 
      : `${SPOTIFY_API_BASE}/me/player/pause`;
    
    await axios.put(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error pausing playback:', error);
    throw error;
  }
};

/**
 * Control playback - Next track
 */
const next = async (spotifyConfig, deviceId = null) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const url = deviceId 
      ? `${SPOTIFY_API_BASE}/me/player/next?device_id=${deviceId}` 
      : `${SPOTIFY_API_BASE}/me/player/next`;
    
    await axios.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error skipping to next track:', error);
    throw error;
  }
};

/**
 * Set playback volume
 */
const setVolume = async (spotifyConfig, volumePercent, deviceId = null) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const url = `${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${volumePercent}${deviceId ? `&device_id=${deviceId}` : ''}`;
    
    await axios.put(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error setting volume:', error);
    throw error;
  }
};

/**
 * Get current playback state
 */
const getPlaybackState = async (spotifyConfig) => {
  const token = await ensureValidToken(spotifyConfig);
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE}/me/player`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting playback state:', error);
    throw error;
  }
};

module.exports = {
  initializeSpotify,
  getAuthorizationUrl,
  exchangeCodeForToken,
  getTrack,
  play,
  pause,
  next,
  setVolume,
  getPlaybackState
};