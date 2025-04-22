// src/components/Dashboard.jsx
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { db } from '../Firebase/firebaseConfig';
import AddSongForm from './AddSongForm';
import CreatePlaylistModal from './CreatePlaylistModal';
import MusicPlayer from './MusicPlayer';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);

  /** real‑time listener for songs in the chosen playlist */
  useEffect(() => {
    if (selectedPlaylist && selectedPlaylist !== 'create') {
      const songsQuery = query(
        collection(db, 'playlists', selectedPlaylist.id, 'songs'),
        orderBy('votes', 'desc')
      );

      const unsubscribe = onSnapshot(
        songsQuery,
        snap => {
          const updated = [];
          snap.forEach(doc => updated.push({ id: doc.id, ...doc.data() }));
          setSongs(updated);
        },
        err => console.error('Error listening to songs:', err)
      );

      return () => unsubscribe();
    }
  }, [selectedPlaylist]);

  /** from PlaylistDropdown */
  const handleSelectPlaylist = playlist => {
    if (playlist === 'create') {
      setShowCreatePlaylistModal(true);
    } else {
      setSelectedPlaylist(playlist);
    }
  };

  /** after creating playlist */
  const handlePlaylistCreated = (newId, data) => {
    setSelectedPlaylist({ id: newId, ...data, ownerId: user.uid });
    setDropdownRefreshKey(k => k + 1);
  };

  return (
    <div
      className="bg-lightBeige min-h-screen p-4"
      style={{ backgroundColor: '#fff7d5' }}
    >
      {/* page title + playlist chooser */}
      <header className="flex flex-col items-center mb-8">
        <h1
          className="text-6xl font-extrabold drop-shadow-xl mb-2"
          style={{
            color: '#a7b8ff',
            textShadow: '2px 2px 0 rgba(0,0,0,0.25)',
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

      {/* add‑song trigger */}
      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowAddSongForm(true)}
        >
          Add a Song Here!
        </button>
      </div>

      {/* songs list */}
      <div className="space-y-4 pb-20">
        <FlipMove>
          {songs.map((song, idx) => (
            <div key={song.id} className="mb-4">
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

      {/* now‑playing bar */}
      <MusicPlayer
        song={
          songs.length
            ? songs[0]
            : { image: '', songTitle: '', artist: '', user: '' }
        }
      />

      {/* pop‑ups */}
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