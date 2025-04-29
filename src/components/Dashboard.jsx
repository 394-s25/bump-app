// src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import FlipMove from 'react-flip-move';
import { MdPersonAddAlt1 } from 'react-icons/md';
import { PiMusicNotesPlusFill } from 'react-icons/pi';
import { db } from '../Firebase/firebaseConfig';
import { removeSongFromPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import AddUserForm from './AddUserForm';
import CreatePlaylistModal from './CreatePlaylistModal';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';
import SpotifyLogin from './SpotifyLogin'; // New import for login component
import SpotifyPlayer from './SpotifyPlayer'; // Changed from MusicPlayer to SpotifyPlayer


const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] =
    useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Test function to verify the token works and debug Spotify SDK issues
  const testSpotify = async () => {
    if (!spotifyToken) {
      alert("No Spotify token available");
      return;
    }
    
    try {
      console.log("Testing Spotify token:", spotifyToken.substring(0, 10) + "...");
      
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });
      
      console.log("Spotify API response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Spotify API error response:", errorText);
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Spotify user data:", data);
      alert(`Spotify API connection working! Hello, ${data.display_name || 'User'}`);
      
      // Check player details
      if (songs.length > 0 && songs[0].spotifyUri) {
        console.log("Top song URI available:", songs[0].spotifyUri);
      } else {
        console.log("No song URI available in top song");
      }
    } catch (error) {
      console.error("Spotify API test error:", error);
      alert(`Spotify API error: ${error.message}`);
    }
  };

  useEffect(() => {
    console.log(selectedPlaylist)
  }, [selectedPlaylist]);

  // Check for Spotify token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setSpotifyToken(token);
    }
  }, []);

  /** realtime songs */
  useEffect(() => {
    if (!selectedPlaylist || selectedPlaylist === 'create') return;
    const q = query(
      collection(db, 'playlists', selectedPlaylist.id, 'songs'),
      orderBy('votes', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setSongs(arr);
    });
    return unsub;
  }, [selectedPlaylist]);


  useEffect(() => {
    // Check if token needs refreshing
    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem('spotify_token_expiry');
      if (!expiry || !spotifyToken) return;
      
      // If token is expired or about to expire, we need to re-authenticate
      if (Date.now() > parseInt(expiry) - (5 * 60 * 1000)) {
        // Replace setStatus with setNotice since that's what's defined in this component
        setNotice('Spotify session expired. Please reconnect.');
        setSpotifyToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    };
    
    // Check on component mount and every minute
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [spotifyToken]);
  
  // Add another useEffect to detect token changes in localStorage
  useEffect(() => {
    // This will help detect when the token is added by AuthHandlerWithRouter
    const handleStorageChange = () => {
      const token = localStorage.getItem('spotify_access_token');
      if (token && token !== spotifyToken) {
        console.log("Token detected in localStorage, updating player");
        setSpotifyToken(token);
      }
    };
    
    // Check immediately and also add a listener
    handleStorageChange();
    
    // Listen for storage events (changes from other tabs/components)
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [spotifyToken]);

  /** select playlist callback */
  const handleSelectPlaylist = pl => {
    if (pl === 'create') setShowCreatePlaylistModal(true);
    else setSelectedPlaylist(pl);
  };

  const handlePlaylistCreated = (id, data) => {
    setSelectedPlaylist({ id, ...data, ownerId: user.uid });
    setDropdownRefreshKey(k => k + 1);
  };

  // Handle successful Spotify login
  const handleSpotifyLogin = (token) => {
    setSpotifyToken(token);
    localStorage.setItem('spotify_access_token', token);
  };

  return (
    <div className="
      min-h-screen p-4
      bg-lightBeige dark:bg-darkBg
      text-gray-900    dark:text-darkText
    ">
      <header className="flex flex-wrap items-center mb-6">
        <div className="text-2xl font-extrabold text-blue-300 dark:text-blue-400">
          {selectedPlaylist ? selectedPlaylist.name : 'Select a Playlist →'}
        </div>

        <PlaylistDropdown
          key={dropdownRefreshKey}
          user={user}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={handleSelectPlaylist}
          onOpenChange={setDropdownOpen}
        />

        {selectedPlaylist && (
          <>
            <div className="flex flex-row items-center space-x-4">
              <button
                disabled={dropdownOpen}
                onClick={() => setShowAddSongForm(true)}
                className="
                  inline-flex items-center justify-center w-10 h-10 rounded-full border shadow-sm
                  bg-blue-300 text-white hover:bg-blue-400 focus:outline-none
                  dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-gray-600
                "
                aria-label="Add song"
              >
                <PiMusicNotesPlusFill />
              </button>

              <button
                onClick={() => setShowAddUserForm(true)}
                className="
                  inline-flex items-center justify-center w-10 h-10 rounded-full border shadow-sm
                  bg-blue-300 text-white hover:bg-blue-400 focus:outline-none
                  dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-gray-600
                "
                aria-label="Add user"
              >
                <MdPersonAddAlt1 />
              </button>
            </div>
          </>
        )}

      {!spotifyToken && (
        <div className="flex justify-center m-4">
          <SpotifyLogin onLogin={handleSpotifyLogin} />
        </div>
      )}
      
      {/* Add the debug button when spotify token is available */}
      {spotifyToken && (
        <div className="flex justify-center m-4">
          <button 
            onClick={testSpotify}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            style={{ backgroundColor: '#4CAF50' }}
          >
            Test Spotify Connection
          </button>
        </div>
      )}
      </header>

      {notice && (
        <div className="
          mb-4 px-4 py-2 text-sm text-white
          bg-red-500 dark:bg-red-600
          rounded
        ">
          {notice}
        </div>
      )}
      <div className="space-y-4 pb-20">
        <FlipMove>
          {songs.map((song, idx) => (
            <div key={song.id}>
              <SongItem
                user={user}
                playlistId={selectedPlaylist ? selectedPlaylist.id : ''}
                song={song}
                isCurrent={idx === 0}
                onVote={() => {}}
              />
            </div>
          ))}
        </FlipMove>
      </div>

      {/* Spotify Player - only owner can control music */}
      {selectedPlaylist && songs.length > 0 && (
        selectedPlaylist.ownerId === user.uid ? (
          spotifyToken ? (
            <SpotifyPlayer
              token={spotifyToken}
              songUri={songs[0].spotifyUri}
              songData={songs[0]}
              onTrackEnd={songId =>
                removeSongFromPlaylist(selectedPlaylist.id, songId)
              }
            />
          ) : (
            <div className="fixed bottom-0 …">
              <p>Please connect your Spotify account in your Profile to control music.</p>
            </div>
          )
        ) : (
          <div className="fixed bottom-0 …">
            <p>Only the playlist owner can control music.</p>
          </div>
        )
      )}

      {showAddSongForm && selectedPlaylist && (
        <AddSongForm
          user={user}
          playlistId={selectedPlaylist.id}
          onClose={() => setShowAddSongForm(false)}
          onAddSong={() => setShowAddSongForm(false)}
        />
      )}

      {showAddUserForm && selectedPlaylist && (
        <AddUserForm
          user={user}
          playlistId={selectedPlaylist.id}
          onClose={() => setShowAddUserForm(false)}
          onAddUser={() => setShowAddUserForm(false)}
        />
      )}

      {showCreatePlaylistModal && (
        <CreatePlaylistModal
          user={user}
          onClose={() => setShowCreatePlaylistModal(false)}
          onCreate={handlePlaylistCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
