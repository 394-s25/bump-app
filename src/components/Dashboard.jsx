// src/components/Dashboard.jsx
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { db } from '../Firebase/firebaseConfig';
import AddSongForm from './AddSongForm';
import CreatePlaylistModal from './CreatePlaylistModal';
import LogoutButton from './Logoutbutton'; // Adjust filename casing as needed
import MusicPlayer from './MusicPlayer';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);

  // Real-time listener for the songs in the selected playlist.
  useEffect(() => {
    if (selectedPlaylist && selectedPlaylist !== "create") {
      const songsQuery = query(
        collection(db, "playlists", selectedPlaylist.id, "songs"),
        orderBy("votes", "desc")
      );
      const unsubscribe = onSnapshot(
        songsQuery,
        (querySnapshot) => {
          const updatedSongs = [];
          querySnapshot.forEach((doc) => {
            updatedSongs.push({ id: doc.id, ...doc.data() });
          });
          setSongs(updatedSongs);
        },
        (error) => {
          console.error("Error listening to songs:", error);
        }
      );
      return () => unsubscribe();
    }
  }, [selectedPlaylist]);

  // Called when the user selects a playlist from the dropdown.
  const handleSelectPlaylist = (playlist) => {
    if (playlist === "create") {
      setShowCreatePlaylistModal(true);
    } else {
      setSelectedPlaylist(playlist);
    }
  };

  // When a new playlist is created, update the selected playlist and force a refresh of PlaylistDropdown.
  const handlePlaylistCreated = async (newPlaylistId, playlistData) => {
    const newPlaylist = { id: newPlaylistId, ...playlistData, ownerId: user.uid };
    setSelectedPlaylist(newPlaylist);
    // Force PlaylistDropdown to refresh by updating its key.
    setDropdownRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="bg-lightBeige min-h-screen p-4 relative" style={{ backgroundColor: '#fff7d5' }}>
      {/* Logout button in top-right corner */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 50 }}>
        <LogoutButton />
      </div>

      <header className="flex flex-col items-center mb-8">
        <h1
          className="text-6xl font-extrabold text-center drop-shadow-xl"
          style={{
            color: '#a7b8ff',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)',
          }}
        >
          BUMP
        </h1>
        <PlaylistDropdown
          key={dropdownRefreshKey}
          user={user}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={handleSelectPlaylist}
        />
      </header>

      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddSongForm(true)}
        >
          Add a Song Here!
        </button>
      </div>

      <div className="space-y-4 pb-20">
        <FlipMove>
          {songs.map((song, index) => (
            <div key={song.id} className="mb-4 mt-4">
              <SongItem
                user={user}
                playlistId={selectedPlaylist ? selectedPlaylist.id : ''}
                song={song}
                isCurrent={index === 0}
                onVote={() => {}}
              />
            </div>
          ))}
        </FlipMove>
      </div>

      <MusicPlayer
        song={
          songs.length > 0
            ? songs[0]
            : { image: '', songTitle: '', artist: '', user: '' }
        }
      />

      {showAddSongForm && selectedPlaylist && (
        <AddSongForm
          user={user}
          playlistId={selectedPlaylist.id}
          onClose={() => setShowAddSongForm(false)}
          onAddSong={() => setShowAddSongForm(false)}
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