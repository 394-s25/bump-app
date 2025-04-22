// src/components/Dashboard.jsx
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { db } from '../Firebase/firebaseConfig';
import AddSongForm from './AddSongForm';
import AddUserForm from './AddUserForm';
import LogoutButton from './Logoutbutton'; // Ensure you have this component
import CreatePlaylistModal from './CreatePlaylistModal';
import MusicPlayer from './MusicPlayer';
import PlaylistDropdown from './PlaylistDropdown';
import SongItem from './SongItem';
import { MdPersonAddAlt1 } from "react-icons/md";
import { PiMusicNotesPlusFill } from "react-icons/pi";


const Dashboard = ({ user }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const [showCreatePlaylistModal, setShowCreatePlaylistModal] =
    useState(false);
  const [dropdownRefreshKey, setDropdownRefreshKey] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notice, setNotice] = useState('');


  useEffect(()=>{
    console.log(selectedPlaylist)
  }, [selectedPlaylist]);

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

  return (
    <div
      className="bg-lightBeige min-h-screen p-4"
      style={{ backgroundColor: '#fff7d5' }}
    >
      <header className="flex flex-row items-center mb-6">
      <div className="text-2xl font-extrabold"
          style={{ color: '#a7b8ff'}}>
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
          <div className="flex justify-center m-4">
            <button
              disabled={dropdownOpen}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none ${
                dropdownOpen
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              style={{
                backgroundColor: '#a7b8ff',
                color: "white",
              }}
              onClick={() => setShowAddSongForm(true)}
            >
              <PiMusicNotesPlusFill />
            </button>
          </div>

          <div className="flex justify-center m-4">
            <button
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 shadow-sm bg-white text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={() => setShowAddUserForm(true)}
              style={{
                backgroundColor: '#a7b8ff',
                color: "white",
              }}
            >
              <MdPersonAddAlt1 />
            </button>
          </div>
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