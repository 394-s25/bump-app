import React, { useEffect, useRef, useState } from 'react';
import MusicPlayer from './MusicPlayer';

// Spotify Web Playback SDK script loader
const loadSpotifyScript = () => {
  if (document.getElementById('spotify-player-script')) return;
  const script = document.createElement('script');
  script.id = 'spotify-player-script';
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  script.onerror = () => console.error("Failed to load Spotify Web Playback SDK");
  document.body.appendChild(script);
};

const SpotifyPlayer = ({ token, songUri, songData, onTrackEnd, isEmpty = false }) => {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [errorMessage, setErrorMessage] = useState('');

  // Keep a mutable ref to always read the latest songData in our listener
  const songRef = useRef(songData);
  songRef.current = songData;

  // 1) Initialize SDK once per token
  useEffect(() => {
    if (!token) return;

    loadSpotifyScript();
    window.onSpotifyWebPlaybackSDKReady = () => {
      const p = new window.Spotify.Player({
        name: 'Bump App Web Player',
        getOAuthToken: cb => cb(token),
        volume: volume / 100
      });

      // Ready / not_ready
      p.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setPlayerReady(true);
      });
      p.addListener('not_ready', () => setPlayerReady(false));

      // Main state listener
      p.addListener('player_state_changed', state => {
        if (!state) return;
        const track = state.track_window.current_track;
        setPosition(state.position);
        setDuration(state.duration);
        setIsPlaying(!state.paused);

        // Detect end / skip
        // if (state.paused && state.position < 1000 && onTrackEnd) {
        //   const current = songRef.current;
        //   if (current?.id) {
        //     onTrackEnd(current.id);
        //   }
        // }
        const previousTracks = state.track_window.previous_tracks;
        const currentTrack = state.track_window.current_track;
        const expectedUri = songRef.current?.spotifyUri; // Get the URI of the song we expect to be playing

        // Check if the player is paused AND the track that just finished playing
        // (the last one in previous_tracks) matches the one we expected.
        if (state.paused && previousTracks.length > 0 && expectedUri) {
          const lastPlayedTrack = previousTracks[previousTracks.length - 1];

          // Condition 1: Track finished naturally (paused near the start of *no* track or the *next* track)
          // AND the *previous* track's URI matches the one that was supposed to be playing.
          // Condition 2: The queue ended (currentTrack is null) AND the last played track matches.
          if (lastPlayedTrack.uri === expectedUri && (state.position < 1000 || !currentTrack)) {
             // Ensure onTrackEnd is called only once per track end
             // Check if the current songRef still matches the expectedUri to avoid race conditions
            if (onTrackEnd && songRef.current?.id && songRef.current?.spotifyUri === expectedUri) {
              console.log(`Track end detected for ${expectedUri}. Calling onTrackEnd for ID: ${songRef.current.id}`);
              onTrackEnd(songRef.current.id);
              // Immediately update the ref to prevent re-triggering for the same ended track
              // This assumes songRef will update shortly after onTrackEnd causes Dashboard state change
            }
          }
        }
      });

      // Error handling
      p.addListener('authentication_error', () => {
        localStorage.removeItem('spotify_access_token');
        setErrorMessage('Session expired. Please reconnect to Spotify.');
      });
      p.addListener('account_error', ({ message }) => setErrorMessage(message));
      p.addListener('initialization_error', ({ message }) => setErrorMessage(message));

      p.connect().then(success => {
        if (success) setPlayer(p);
      });

      // Cleanup
      return () => {
        p.disconnect();
        window.onSpotifyWebPlaybackSDKReady = null;
      };
    };
  }, [token]);

  // 2) Play whenever songUri changes
  useEffect(() => {
    if (!player || !deviceId || !songUri || !playerReady || isEmpty) return;
    setPosition(0);
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [songUri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).catch(err => setErrorMessage(err.message));
  }, [player, deviceId, songUri, playerReady, isEmpty, token]);

  // 3) Volume control
  useEffect(() => {
    if (player) player.setVolume(volume / 100).catch(console.error);
  }, [volume, player]);

  // 4) Position tracking fallback (once per second)
  useEffect(() => {
    if (!isPlaying || duration <= 0) return;
    const id = setInterval(() => {
      setPosition(pos => Math.min(pos + 1000, duration));
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, duration]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!player) return;
    setIsPlaying(play => !play);
    player.togglePlay().catch(console.error);
  };

  // Skip to next & remove current
  const nextTrack = () => {
    if (songRef.current?.id && onTrackEnd) {
      onTrackEnd(songRef.current.id);
    }
    player?.nextTrack().catch(console.error);
  };

  // Seek
  const handleSeek = pct => {
    if (player && duration) {
      const ms = (pct / 100) * duration;
      player.seek(ms).catch(console.error);
      setPosition(ms);
    }
  };

  // Format MM:SS
  const formatTime = ms => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // Data to display
  const display = {
    songTitle: songData?.songTitle || 'Not Playing',
    artist: songData?.artist || 'Spotify',
    image: songData?.image || '',
    user: songData?.user || 'Spotify'
  };

  if (isEmpty) {
    return (
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-blue-200 text-center">
        Add songs to your queue to start playing
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <div className="text-red-600 text-center p-2">{errorMessage}</div>
      )}
      <MusicPlayer
        song={display}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        nextTrack={nextTrack}
        volume={volume}
        onVolumeChange={setVolume}
        position={position}
        duration={duration}
        onSeek={handleSeek}
        formatTime={formatTime}
        isActive={playerReady}
      />
    </>
  );
};

export default SpotifyPlayer;