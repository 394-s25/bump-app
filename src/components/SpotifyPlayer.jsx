import React, { useEffect, useState } from 'react';
import MusicPlayer from './MusicPlayer';

// Spotify Web Playback SDK script
const loadSpotifyScript = () => {
  if (document.getElementById('spotify-player-script')) {
    console.log("Spotify script already loaded, skipping");
    return;
  }
  
  console.log("Loading Spotify Web Playback SDK script");
  const script = document.createElement('script');
  script.id = 'spotify-player-script';
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  script.onerror = () => {
    console.error("Failed to load Spotify Web Playback SDK script");
  };
  document.body.appendChild(script);
};

const SpotifyPlayer = ({ token, songUri, songData }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(50);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(100);
  const [playerReady, setPlayerReady] = useState(false);
  const [loadingState, setLoadingState] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load Spotify SDK with better error tracking
  useEffect(() => {
    if (!token) {
      console.log("No token provided to SpotifyPlayer");
      setLoadingState('no-token');
      return;
    }
    
    console.log("Initializing Spotify Player with token:", token.substring(0, 10) + "...");
    setLoadingState('loading-sdk');
    
    // Load the SDK script
    loadSpotifyScript();
    
    // Set up the SDK ready handler
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("Spotify Web Playback SDK is ready");
      setLoadingState('sdk-ready');
      
      try {
        const player = new window.Spotify.Player({
          name: 'Bump App Web Player',
          getOAuthToken: cb => { 
            console.log("Token requested by Spotify SDK");
            cb(token); 
          },
          volume: volume / 100
        });

        // Event listeners with improved logging
        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify player ready with Device ID:', device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
          setLoadingState('player-ready');
          setErrorMessage('');
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline:', device_id);
          setPlayerReady(false);
          setLoadingState('device-offline');
        });

        // IMPORTANT: This is the fixed player_state_changed listener, properly placed inside the SDK ready handler
        player.addListener('player_state_changed', state => {
          if (!state) {
            console.log('No player state available');
            return;
          }
          
          try {
            const track = state.track_window.current_track;
            console.log('Now playing track:', track.name, 'by', track.artists[0].name);
            
            setCurrentTrack({
              songTitle: track.name,
              artist: track.artists[0].name,
              image: track.album.images[0].url,
              user: songData?.user || 'Spotify',
            });
            
            // These two lines are critical for syncing UI with actual playback
            setIsPlaying(!state.paused);
            setPosition(state.position);
            setDuration(state.duration);
            
            // Log state changes to help with debugging
            console.log(`Player state update: position=${state.position}ms, duration=${state.duration}ms, paused=${state.paused}`);
          } catch (err) {
            console.error('Error processing player state:', err);
          }
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Spotify player initialization error:', message);
          setErrorMessage(`Initialization error: ${message}`);
          setLoadingState('init-error');
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Spotify authentication error:', message);
          setErrorMessage(`Authentication error: ${message}`);
          setLoadingState('auth-error');
          // Authentication errors often mean token expired or is invalid
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_token_expiry');
        });

        player.addListener('account_error', ({ message }) => {
          console.error('Spotify account error:', message);
          setErrorMessage(`Account error: ${message}`);
          setLoadingState('account-error');
        });

        console.log('Connecting to Spotify...');
        player.connect().then(success => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
            setPlayer(player);
            setLoadingState('connected');
          } else {
            console.error('Failed to connect to Spotify');
            setLoadingState('connect-failed');
            setErrorMessage('Failed to connect to Spotify. Please try again.');
          }
        }).catch(error => {
          console.error('Error connecting to Spotify:', error);
          setLoadingState('connect-error');
          setErrorMessage(`Error connecting: ${error.message}`);
        });
    
        return () => {
          console.log("Disconnecting Spotify player");
          player.disconnect();
        };
      } catch (error) {
        console.error("Error initializing Spotify player:", error);
        setLoadingState('player-init-error');
        setErrorMessage(`Player initialization error: ${error.message}`);
      }
    };
    
    // Cleanup function for the effect
    return () => {
      // Reset the SDK ready handler to prevent memory leaks
      if (window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = null;
      }
    };
  }, [token, volume, songData]);

  // Play song when songUri changes with enhanced logging and error handling
  useEffect(() => {
    const playSong = async () => {
      // Log the state of all required components
      console.log("Play song called with state:", { 
        playerExists: !!player,
        deviceId,
        songUri,
        playerReady,
        loadingState
      });
      
      // Validate all required components are ready
      if (!player) {
        console.log("Player not initialized yet");
        return;
      }
      
      if (!deviceId) {
        console.log("No device ID available yet");
        return;
      }
      
      if (!songUri) {
        console.log("No song URI provided");
        return;
      }
      
      if (!playerReady) {
        console.log("Player not ready yet");
        return;
      }
      
      console.log("Attempting to play song:", songUri, "on device:", deviceId);
      
      try {
        // Play the track
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [songUri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        // Handle non-OK responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Play request failed:", response.status, errorText);
          
          if (response.status === 403) {
            console.error("Permission denied. User might need a premium account.");
            setErrorMessage("Premium account required for playback control");
          } else if (response.status === 404) {
            console.error("Device not found. The device might have been disconnected.");
            setPlayerReady(false);
            setErrorMessage("Playback device not found");
          } else if (response.status === 401) {
            console.error("Unauthorized. Token might have expired.");
            // Clear token and refresh the page
            localStorage.removeItem('spotify_access_token');
            setErrorMessage("Session expired. Please reconnect to Spotify.");
          } else {
            setErrorMessage(`Playback error: ${response.status}`);
          }
          return;
        }
        
        console.log('Now playing:', songUri);
        setErrorMessage(''); // Clear any previous errors
      } catch (error) {
        console.error('Error playing song:', error);
        setErrorMessage(`Playback error: ${error.message}`);
      }
    };
    
    // Only attempt to play if we have all required pieces
    if (player && deviceId && songUri && playerReady) {
      playSong();
    }
  }, [player, deviceId, songUri, token, playerReady]);

  // Handle play/pause
  const togglePlay = () => {
    if (!player) {
      console.log("Can't toggle play: player not initialized");
      return;
    }
    
    console.log("Toggling playback state");
    
    // Update UI immediately for better responsiveness
    setIsPlaying(!isPlaying);
    
    player.togglePlay()
      .then(() => console.log("Playback state toggled"))
      .catch(err => {
        console.error("Error toggling playback:", err);
        // Reset UI state if there was an error
        setIsPlaying(isPlaying);
      });
  };

  // Handle next track
  const nextTrack = () => {
    if (!player) {
      console.log("Can't skip track: player not initialized");
      return;
    }
    
    console.log("Skipping to next track");
    player.nextTrack()
      .then(() => console.log("Skipped to next track"))
      .catch(err => console.error("Error skipping track:", err));
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (player) {
      console.log("Setting volume to:", newVolume/100);
      player.setVolume(newVolume / 100)
        .then(() => console.log("Volume updated"))
        .catch(err => console.error("Error setting volume:", err));
    }
  };

  // Handle seeking
  const handleSeek = (seekPos) => {
    if (!player || !duration) {
      console.log("Can't seek: player not initialized or duration unknown");
      return;
    }
    
    const seekMs = (seekPos * duration) / 100;
    console.log("Seeking to position:", seekMs, "ms");
    player.seek(seekMs)
      .then(() => console.log("Seek position updated"))
      .catch(err => console.error("Error seeking:", err));
  };

  // Format time (seconds -> MM:SS)
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add position tracking with interval timer
  useEffect(() => {
    let intervalId;
    
    // If music is playing, update the position every 1000ms (1 second)
    if (isPlaying && duration > 0) {
      intervalId = setInterval(() => {
        // Update position based on elapsed time since last update
        setPosition(prevPosition => {
          // Don't exceed the duration
          const newPosition = Math.min(prevPosition + 1000, duration);
          return newPosition;
        });
      }, 1000);
      
      console.log("Started position tracking interval");
    }
    
    // Clean up the interval when playback stops or component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("Cleared position tracking interval");
      }
    };
  }, [isPlaying, duration]);

  // Use either Spotify track data or provided song data
  const displaySongData = currentTrack || songData || {
    songTitle: 'Not Playing',
    artist: 'Connect to Spotify',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f', // Default image
    user: 'Spotify'
  };
  
  // Display any errors above the music player
  const errorDisplay = errorMessage ? (
    <div className="text-center p-2 bg-red-100 text-red-700 mb-2 rounded">
      {errorMessage}
    </div>
  ) : null;

  return (
    <>
      {errorDisplay}
      <MusicPlayer 
        song={displaySongData}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        nextTrack={nextTrack}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        position={position}
        duration={duration}
        onSeek={handleSeek}
        formatTime={formatTime}
      />
    </>
  );
};

export default SpotifyPlayer;