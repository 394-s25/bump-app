import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { MdPersonAddAlt1 } from "react-icons/md";
import { PiMusicNotesPlusFill } from "react-icons/pi";
import { db } from '../Firebase/firebaseConfig';
import { removeSongFromPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import AddUserForm from './AddUserForm';
import CreatePlaylistModal from './CreatePlaylistModal';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';
import SpotifyLogin from './SpotifyLogin';
import SpotifyPlayer from './SpotifyPlayer';

const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [processingRemoval, setProcessingRemoval] = useState(false);

  const debug = {
    logPermissions: async () => {
      if (!selectedPlaylist) {
        console.log("No playlist selected");
        return;
      }
      
      if (!user) {
        console.log("No user logged in");
        return;
      }
      
      try {
        const playlistRef = doc(db, "playlists", selectedPlaylist.id);
        const playlistSnap = await getDoc(playlistRef);
        
        if (!playlistSnap.exists()) {
          console.log("Playlist doesn't exist");
          return;
        }
        
        const playlistData = playlistSnap.data();
        
        console.log("Playlist permissions check:");
        console.log("- Current user ID:", user.uid);
        console.log("- Playlist owner ID:", playlistData.ownerId);
        console.log("- Is owner?", playlistData.ownerId === user.uid);
        console.log("- Shared with:", playlistData.sharedWith || []);
        console.log("- Is in shared list?", playlistData.sharedWith?.includes(user.uid));
        // console.log("- Is public?", playlistData.isPublic === true);
        
        const canModify = playlistData.ownerId === user.uid || 
                         playlistData.sharedWith?.includes(user.uid);
        console.log("- Can modify playlist?", canModify);
        
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    }
  };
  // Test function to verify the token works and debug Spotify SDK issues
  const testSpotify = async () => {
    if (!spotifyToken) {
      alert("No Spotify token available");
      return;
    }
    try {
      console.log("Testing Spotify token:", spotifyToken.substring(0, 10) + "...");
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
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
      
      // Check song data
      if (songs.length > 0) {
        console.log("Top song data:", songs[0]);
        console.log("Top song has URI:", !!songs[0].spotifyUri);
      }
    } catch (error) {
      console.error("Spotify API test error:", error);
      alert(`Spotify API error: ${error.message}`);
    }
  };

  useEffect(() => {
    console.log(selectedPlaylist);
  }, [selectedPlaylist]);

  // Debug song data when it loads or changes
  useEffect(() => {
    if (songs.length > 0) {
      console.log(`Loaded ${songs.length} songs, top song:`, songs[0]);
    }
  }, [songs]);

  // Check for Spotify token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) setSpotifyToken(token);
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

  // Token expiry checker
  useEffect(() => {
    const checkTokenExpiry = () => {
      const expiry = localStorage.getItem('spotify_token_expiry');
      if (!expiry || !spotifyToken) return;
      if (Date.now() > parseInt(expiry) - 5 * 60 * 1000) {
        setNotice('Spotify session expired. Please reconnect.');
        setSpotifyToken(null);
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_token_expiry');
      }
    };
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    return () => clearInterval(interval);
  }, [spotifyToken]);

  // Detect token changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('spotify_access_token');
      if (token && token !== spotifyToken) {
        console.log("Token detected in localStorage, updating player");
        setSpotifyToken(token);
      }
    };
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [spotifyToken]);

  /** select playlist callback */
  const handleSelectPlaylist = pl => {
    if (pl === 'create') setShowCreatePlaylistModal(true);
    else setSelectedPlaylist(pl);
  };

  /** after new playlist created */
  const handlePlaylistCreated = (id, data) => {
    setSelectedPlaylist({ id, ...data, ownerId: user.uid });
    setDropdownRefreshKey(k => k + 1);
  };

  // Handle successful Spotify login
  const handleSpotifyLogin = token => {
    setSpotifyToken(token);
    localStorage.setItem('spotify_access_token', token);
  };

  // Enhanced song completion handler with debouncing
  const handleSongComplete = async (songId) => {
    if (!selectedPlaylist || processingRemoval) return false;
    
    try {
      setProcessingRemoval(true);
      console.log(`Removing completed song ${songId} from playlist ${selectedPlaylist.id}`);
      
      await removeSongFromPlaylist(selectedPlaylist.id, songId);
      console.log("Song removed successfully, Firebase should auto-update");
      
      // Set a brief timeout to prevent multiple rapid removals
      setTimeout(() => {
        setProcessingRemoval(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.error("Error removing completed song:", error);
      setNotice("Error removing song after completion");
      setProcessingRemoval(false);
      return false;
    }
  };

  // Utility to check song URIs
  const checkSongURIs = () => {
    if (songs.length === 0) {
      alert("No songs in playlist");
      return;
    }
    
    const songsWithoutUri = songs.filter(song => !song.spotifyUri);
    if (songsWithoutUri.length === 0) {
      alert("All songs have proper Spotify URIs!");
    } else {
      alert(`Found ${songsWithoutUri.length} songs without Spotify URIs. Please re-add these songs.`);
      console.table(songsWithoutUri.map(s => ({
        title: s.songTitle,
        artist: s.artist,
        user: s.user
      })));
    }
  };

  return (
    <div className="bg-lightBeige min-h-screen p-4" style={{ backgroundColor: '#fff7d5' }}>
      <header className="flex flex-row items-center mb-6">
        <div className="text-2xl font-extrabold" style={{ color: '#a7b8ff' }}>
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
            <button
              disabled={dropdownOpen}
              className={`m-4 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center ${
                dropdownOpen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: '#a7b8ff' }}
              onClick={() => setShowAddSongForm(true)}
            >
              <PiMusicNotesPlusFill />
            </button>
            <button
              className="m-4 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center"
              style={{ backgroundColor: '#a7b8ff' }}
              onClick={() => setShowAddUserForm(true)}
            >
              <MdPersonAddAlt1 />
            </button>
          </>
        )}
        {!spotifyToken && (
          <div className="m-4">
            <SpotifyLogin onLogin={handleSpotifyLogin} />
          </div>
        )}
        {spotifyToken && (
          <>
            <button
              onClick={testSpotify}
              className="m-4 px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: '#4CAF50' }}
            >
              Test Spotify Connection
            </button>
            <button
              onClick={checkSongURIs}
              className="m-4 px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: '#FFA500' }}
            >
              Check Song URIs
            </button>
            <button
              onClick={debug.logPermissions}
              className="m-4 px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: '#FF5722' }}
            >
              Check Permissions
            </button>
          </>
        )}
      </header>

      {notice && (
        <div className="mb-4 px-4 py-2 text-sm text-center text-white bg-red-500 rounded">
          {notice}
        </div>
      )}

      <div className="space-y-4 pb-20">
        <FlipMove>
          {songs.map((song, idx) => (
            <div key={song.id}>
              <SongItem
                user={user}
                playlistId={selectedPlaylist?.id || ''}
                song={song}
                isCurrent={idx === 0}
                onVote={() => {}}
              />
            </div>
          ))}
        </FlipMove>
        
        {songs.length === 0 && selectedPlaylist && (
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">No songs in this playlist. Add songs to get started!</p>
          </div>
        )}
      </div>

      {(spotifyToken || (songs.length > 0 && songs[0]?.spotifyUri)) ? (
        <SpotifyPlayer
          token={spotifyToken}
          songUri={songs.length > 0 && songs[0]?.spotifyUri ? songs[0].spotifyUri : null}
          songData={songs.length > 0 ? songs[0] : { image: '', songTitle: '', artist: '', user: '' }}
          playlistId={selectedPlaylist?.id}
          songs={songs}
          onSongComplete={handleSongComplete}
        />
      ) : (
        <div
          className="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-center z-50 border-t shadow-md"
          style={{ backgroundColor: '#a7b8ff', color: '#000' }}
        >
          <p>Please connect Spotify to enable playback</p>
        </div>
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