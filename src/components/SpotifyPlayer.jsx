import { doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../Firebase/firebaseConfig';
import { updatePlaybackState } from '../Firebase/playlist';
import MusicPlayer from './MusicPlayer';

// Spotify Web Playback SDK script loader
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
  script.onerror = () => console.error("Failed to load Spotify SDK");
  document.body.appendChild(script);
};

const SpotifyPlayer = ({
  token,
  songUri,
  songData,
  playlistId,
  songs,
  onSongComplete
}) => {
  // Player state
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

  // Sync state
  const [isActiveDevice] = useState(!!token);
  const [syncedPlaybackState, setSyncedPlaybackState] = useState(null);
  
  // Track status refs for better handling of track ending
  const handlingTrackEnd = useRef(false);
  const previousTrack = useRef(null);
  const autoPlayNextPending = useRef(false);
  const lastPosition = useRef(0);
  const trackEndDetectionTimer = useRef(null);
  const trackEndTimeoutRef = useRef(null);

  // Update Firebase with current playback state
  const updateFirebasePlaybackState = useCallback(async (state) => {
    if (!playlistId) return;
    
    try {
      await updatePlaybackState(playlistId, {
        isPlaying: state.isPlaying !== undefined ? state.isPlaying : isPlaying,
        position: state.position !== undefined ? state.position : position,
        volume: state.volume !== undefined ? state.volume : volume,
        duration: state.duration !== undefined ? state.duration : duration,
        currentSongId: songData?.id || null,
        spotifyUri: songUri || null,
        hasActiveDevice: !!token,
        deviceId: deviceId || null,
        songData: songData || null
      });
    } catch (err) {
      console.error('Error updating playback state:', err);
    }
  }, [playlistId, isPlaying, position, volume, duration, songData, songUri, token, deviceId]);

  // Listen for playback state changes from Firebase
  useEffect(() => {
    if (!playlistId) return;

    const ref = doc(db, "playlists", playlistId, "playback_state", "current");
    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;

      const data = snap.data();
      setSyncedPlaybackState(data);

      // If this device doesn't have Spotify connected, update UI based on the connected device
      if (!token && data.hasActiveDevice) {
        setIsPlaying(data.isPlaying);
        setPosition(data.position);
        setVolume(data.volume);
        if (data.duration) setDuration(data.duration);
        
        if (data.songData) {
          setCurrentTrack({
            songTitle: data.songData.songTitle,
            artist: data.songData.artist,
            image: data.songData.image,
            user: data.songData.user || 'Spotify'
          });
        }
      }
    });
    return () => unsub();
  }, [playlistId, token]);

  // Load Spotify SDK
  useEffect(() => {
    loadSpotifyScript();
    if (!token) {
      console.log("No token provided – operating in sync mode");
      setLoadingState('sync-mode');
      return;
    }

    setLoadingState('loading-sdk');
    console.log("Initializing Spotify Player with token:", token.substring(0, 10) + "...");
    
    window.onSpotifyWebPlaybackSDKReady = () => {
      try {
        console.log("Spotify SDK ready, initializing player");
        const sdkPlayer = new window.Spotify.Player({
          name: 'Bump App Web Player',
          getOAuthToken: cb => {
            console.log("Token requested by SDK");
            cb(token);
          },
          volume: volume/100
        });

        sdkPlayer.addListener('ready', ({ device_id }) => {
          console.log('Player ready with device ID:', device_id);
          setDeviceId(device_id);
          setPlayerReady(true);
          setLoadingState('player-ready');
          setErrorMessage('');
          setPlayer(sdkPlayer);
        });

        sdkPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('Device offline:', device_id);
          setPlayerReady(false);
          setLoadingState('device-offline');
        });

        // Enhanced player_state_changed listener
        sdkPlayer.addListener('player_state_changed', state => {
          if (!state) {
            console.log('No player state available');
            return;
          }
          
          try {
            const track = state.track_window.current_track;
            console.log('Now playing:', track.name, 'by', track.artists[0].name, 
                       `(position: ${state.position}/${state.duration}, paused: ${state.paused})`);

            // Store track data for UI
            setCurrentTrack({
              songTitle: track.name,
              artist: track.artists[0].name,
              image: track.album.images[0].url,
              user: songData?.user || 'Spotify'
            });
            
            // Update playback state
            setIsPlaying(!state.paused);
            setPosition(state.position);
            setDuration(state.duration);
            lastPosition.current = state.position;
            
            // Track change detection
            if (previousTrack.current && 
                previousTrack.current !== track.id && 
                autoPlayNextPending.current) {
              console.log("Track changed after auto-play");
              autoPlayNextPending.current = false;
            }
            previousTrack.current = track.id;

            // Sync to Firebase for other devices
            updateFirebasePlaybackState({
              isPlaying: !state.paused,
              position: state.position,
              duration: state.duration
            });

            // Track completion detection via position monitoring
            if (!state.paused && state.position > 0 && state.duration > 0) {
              // If position is very close to the end (last 1-2 seconds)
              if (state.position >= state.duration - 2000) {
                console.log("Near end of track detected in state update");
                
                // Set up a completion timeout if not already set
                if (!trackEndTimeoutRef.current) {
                  console.log("Setting track end timeout");
                  trackEndTimeoutRef.current = setTimeout(() => {
                    console.log("Track ended via timeout");
                    handleTrackEnded();
                    trackEndTimeoutRef.current = null;
                  }, 2000); // Wait 2 seconds then assume track is done
                }
              } else if (trackEndTimeoutRef.current && state.position < state.duration - 2000) {
                // If we moved away from the end, clear the timeout
                console.log("Clearing track end timeout - no longer near end");
                clearTimeout(trackEndTimeoutRef.current);
                trackEndTimeoutRef.current = null;
              }
            }

            // Track end detection - check if near end and paused
            const wasNearEnd = lastPosition.current > 0 && 
                               lastPosition.current >= state.duration - 3000;
            
            if (wasNearEnd && state.paused && !handlingTrackEnd.current) {
              console.log("Track ended detection via state change");
              handleTrackEnded();
            }
          } catch (err) {
            console.error('Error processing player state:', err);
          }
        });

        sdkPlayer.addListener('initialization_error', ({ message }) => {
          console.error('Initialization error:', message);
          setErrorMessage(`Initialization error: ${message}`);
          setLoadingState('init-error');
        });

        sdkPlayer.addListener('authentication_error', ({ message }) => {
          console.error('Authentication error:', message);
          setErrorMessage(`Authentication error: ${message}`);
          setLoadingState('auth-error');
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_token_expiry');
        });

        sdkPlayer.addListener('account_error', ({ message }) => {
          console.error('Account error:', message);
          setErrorMessage(`Account error: ${message}`);
          setLoadingState('account-error');
        });

        console.log('Connecting to Spotify...');
        sdkPlayer.connect().then(success => {
          if (success) {
            console.log('Successfully connected to Spotify!');
            setLoadingState('connected');
            
            // Check premium status
            fetch('https://api.spotify.com/v1/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => {
              const isPremium = data.product === 'premium';
              console.log("User has Premium subscription:", isPremium);
              if (!isPremium) {
                setErrorMessage("Spotify Premium required for playback in browser");
              }
            })
            .catch(err => console.error("Error checking premium status:", err));
          } else {
            console.error('Failed to connect to Spotify');
            setLoadingState('connect-failed');
            setErrorMessage('Failed to connect to Spotify. Please try again.');
          }
        });

        return () => {
          console.log("Disconnecting player");
          if (sdkPlayer) sdkPlayer.disconnect();
        };
      } catch (err) {
        console.error("Player initialization error:", err);
        setLoadingState('player-init-error');
        setErrorMessage(`Player error: ${err.message}`);
      }
    };

    return () => {
      window.onSpotifyWebPlaybackSDKReady = null;
    };
  }, [token, volume, updateFirebasePlaybackState]);

  // Track end handler with debouncing
  const handleTrackEnded = useCallback(async () => {
    if (handlingTrackEnd.current) {
      console.log("Already handling track end, skipping duplicate call");
      return;
    }
    
    console.log("Track ended - removing from playlist");
    handlingTrackEnd.current = true;
    
    if (trackEndDetectionTimer.current) {
      clearTimeout(trackEndDetectionTimer.current);
    }
    
    if (onSongComplete && songData?.id) {
      try {
        console.log(`Removing song ${songData.id}`);
        await onSongComplete(songData.id);
        console.log("Song removed successfully, next song should auto-play");
      } catch (error) {
        console.error("Error handling song completion:", error);
      }
    } else {
      console.log("No song to remove or no handler provided");
    }
    
    // Reset after a delay
    setTimeout(() => {
      handlingTrackEnd.current = false;
    }, 5000);
  }, [onSongComplete, songData]);

  // Auto-play song when URI changes
  useEffect(() => {
    const playSong = async () => {
      if (!player || !deviceId || !songUri || !playerReady) {
        console.log("Cannot play song yet - missing requirements", {
          hasPlayer: !!player,
          deviceId,
          songUri,
          playerReady
        });
        return;
      }
      
      console.log("Playing song:", songUri, "on device:", deviceId);
      
      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [songUri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Play request failed:", response.status, errorText);
          
          if (response.status === 403) {
            setErrorMessage("Premium account required for playback control");
          } else if (response.status === 404) {
            setPlayerReady(false);
            setErrorMessage("Playback device not found");
          } else if (response.status === 401) {
            localStorage.removeItem('spotify_access_token');
            setErrorMessage("Session expired. Please reconnect to Spotify.");
          } else {
            setErrorMessage(`Playback error: ${response.status}`);
          }
          return;
        }
        
        console.log("Playback started successfully");
        setErrorMessage('');
        setIsPlaying(true);
        // Reset track end handling state
        handlingTrackEnd.current = false;
      } catch (error) {
        console.error("Error playing song:", error);
        setErrorMessage(`Playback error: ${error.message}`);
      }
    };
    
    playSong();
  }, [player, deviceId, songUri, token, playerReady]);

  // Additional track end detection using time-based approach
  useEffect(() => {
    // Only monitor position if playing and we know the duration
    if (isPlaying && duration > 0) {
      // If we're near the end of the track (within 2 seconds)
      if (position >= duration - 2000) {
        console.log("Near end of track, setting up end detection");
        
        // Clear any existing timer
        if (trackEndDetectionTimer.current) {
          clearTimeout(trackEndDetectionTimer.current);
        }
        
        // Set a timer that will fire if we don't get a state update
        trackEndDetectionTimer.current = setTimeout(() => {
          console.log("Track end detected via timer");
          handleTrackEnded();
        }, 2500); // Wait 2.5 seconds to ensure we're really at the end
      }
    }
    
    return () => {
      if (trackEndDetectionTimer.current) {
        clearTimeout(trackEndDetectionTimer.current);
      }
    };
  }, [position, duration, isPlaying, handleTrackEnded]);

  // Position tracking with interval for smoother UI updates
  useEffect(() => {
    let intervalId;
    
    if (isPlaying && duration > 0) {
      intervalId = setInterval(() => {
        setPosition(prevPosition => {
          const newPosition = Math.min(prevPosition + 1000, duration);
          return newPosition;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, duration]);

  // Monitor song URI changes
  useEffect(() => {
    if (songUri) {
      console.log("Song URI changed:", songUri);
      
      // If we were handling a track end, this is likely the next song
      if (handlingTrackEnd.current) {
        console.log("New song detected after track ended");
        autoPlayNextPending.current = true;
        
        // Reset position for the new track
        setPosition(0);
      }
    }
  }, [songUri]);

  // Handle play/pause
  const togglePlay = () => {
    if (player && token) {
      console.log("Toggling playback via Spotify SDK");
      
      // Update UI immediately for better responsiveness
      setIsPlaying(!isPlaying);
      
      player.togglePlay()
        .then(() => console.log("Playback toggled"))
        .catch(err => {
          console.error("Toggle playback error:", err);
          setIsPlaying(isPlaying); // Reset on error
        });
    } else if (syncedPlaybackState?.hasActiveDevice) {
      console.log("Toggling playback via Firebase sync");
      updateFirebasePlaybackState({ isPlaying: !isPlaying });
      setIsPlaying(!isPlaying);
    } else {
      console.log("Cannot toggle play: no active device");
    }
  };

  // Handle next track
  const nextTrack = () => {
    if (player && token) {
      console.log("Skipping to next track via Spotify SDK");
      player.nextTrack()
        .then(() => console.log("Skipped to next track"))
        .catch(err => console.error("Next track error:", err));
    } else if (syncedPlaybackState?.hasActiveDevice) {
      console.log("Requesting next track via Firebase");
      updateFirebasePlaybackState({
        requestNextTrack: true,
        requestTimestamp: new Date().toISOString()
      });
    } else {
      console.log("Cannot skip track: no active device");
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    
    if (player && token) {
      console.log("Setting volume to:", newVolume/100);
      player.setVolume(newVolume / 100)
        .then(() => console.log("Volume updated"))
        .catch(err => console.error("Volume error:", err));
    }
    
    // Update volume in Firebase for syncing
    updateFirebasePlaybackState({ volume: newVolume });
  };

  // Handle seeking
  const handleSeek = (seekPos) => {
    if (player && token && duration) {
      const seekMs = (seekPos * duration) / 100;
      console.log("Seeking to position:", seekMs, "ms");
      
      player.seek(seekMs)
        .then(() => console.log("Seek position updated"))
        .catch(err => console.error("Seek error:", err));
    } else if (syncedPlaybackState?.hasActiveDevice && duration) {
      console.log("Requesting seek via Firebase");
      const seekMs = (seekPos * duration) / 100;
      updateFirebasePlaybackState({
        position: seekMs,
        seekRequested: true
      });
    } else {
      console.log("Cannot seek: no active device or duration unknown");
    }
  };

  // Format time (milliseconds -> MM:SS)
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Respond to Firebase sync requests
  useEffect(() => {
    if (!player || !token || !syncedPlaybackState || !deviceId) return;

    // Handle next track requests
    if (syncedPlaybackState.requestNextTrack && 
        deviceId === syncedPlaybackState.deviceId) {
      console.log("Handling external next track request");
      handleTrackEnded();
      
      // Clear the request
      updateFirebasePlaybackState({ requestNextTrack: false });
    }
    
    // Handle seek requests
    if (syncedPlaybackState.seekRequested && 
        deviceId === syncedPlaybackState.deviceId) {
      console.log("Handling external seek request");
      player.seek(syncedPlaybackState.position)
        .then(() => console.log("External seek handled"))
        .catch(err => console.error("External seek error:", err));
      
      // Clear the request
      updateFirebasePlaybackState({ seekRequested: false });
    }
    
    // Handle play/pause requests
    if (syncedPlaybackState.isPlaying !== undefined && 
        isPlaying !== syncedPlaybackState.isPlaying && 
        deviceId === syncedPlaybackState.deviceId) {
      console.log("Handling external play/pause request");
      if (syncedPlaybackState.isPlaying) {
        player.resume().catch(err => console.error("Resume error:", err));
      } else {
        player.pause().catch(err => console.error("Pause error:", err));
      }
    }
    
    // Handle volume changes
    if (syncedPlaybackState.volume !== undefined && 
        volume !== syncedPlaybackState.volume && 
        deviceId === syncedPlaybackState.deviceId) {
      console.log("Handling external volume change");
      player.setVolume(syncedPlaybackState.volume / 100)
        .then(() => setVolume(syncedPlaybackState.volume))
        .catch(err => console.error("Volume change error:", err));
    }
  }, [token, player, syncedPlaybackState, deviceId, isPlaying, volume, handleTrackEnded, updateFirebasePlaybackState]);

  // Use either Spotify track data or provided song data for display
  const displaySongData = currentTrack || songData || {
    songTitle: 'Not Playing',
    artist: 'Connect to Spotify',
    image: 'https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f',
    user: 'Spotify'
  };
  
  // Display any errors
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
        isActive={isActiveDevice || syncedPlaybackState?.hasActiveDevice}
      />
    </>
  );
};

export default SpotifyPlayer;