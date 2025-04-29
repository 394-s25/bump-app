// src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import FlipMove from 'react-flip-move';
import { MdPersonAddAlt1 } from 'react-icons/md';
import { PiMusicNotesPlusFill } from 'react-icons/pi';
import { db } from '../Firebase/firebaseConfig';
import AddSongForm from './AddSongForm';
import AddUserForm from './AddUserForm';
import CreatePlaylistModal from './CreatePlaylistModal';
import MusicPlayer from './MusicPlayer';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    console.log(selectedPlaylist);
  }, [selectedPlaylist]);

  // realtime songs listener
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

  const handleSelectPlaylist = pl => {
    if (pl === 'create') setShowCreatePlaylistModal(true);
    else setSelectedPlaylist(pl);
  };

  const handlePlaylistCreated = (id, data) => {
    setSelectedPlaylist({ id, ...data, ownerId: user.uid });
    setDropdownRefreshKey(k => k + 1);
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

      <MusicPlayer
        song={
          songs.length
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
