// src/components/Dashboard.jsx
import React, { useCallback, useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { getPublicPlaylists, getSongsForPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import MusicPlayer from './MusicPlayer';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const [publicPlaylist, setPublicPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);

  // Fetch songs for a given playlist using its ID.
  const fetchSongs = useCallback(async (playlistId) => {
    try {
      const songsData = await getSongsForPlaylist(playlistId);
      const sortedSongs = songsData.sort((a, b) => b.votes - a.votes);
      setSongs(sortedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  }, []);

  // Fetch all public playlists and pick one (here, the first one).
  const fetchPublicPlaylist = useCallback(async () => {
    try {
      const publicPlaylists = await getPublicPlaylists();
      if (publicPlaylists.length > 0) {
        const defaultPublicPlaylist = publicPlaylists[0];
        setPublicPlaylist(defaultPublicPlaylist);
        // Load songs from the selected public playlist.
        fetchSongs(defaultPublicPlaylist.id);
      } else {
        console.log('No public playlists found');
      }
    } catch (error) {
      console.error('Error fetching public playlists:', error);
    }
  }, [fetchSongs]);

  useEffect(() => {
    fetchPublicPlaylist();
  }, [fetchPublicPlaylist]);

  return (
    <div className="bg-lightBeige min-h-screen p-4" style={{ backgroundColor: '#fff7d5' }}>
      <header className="text-center mb-8">
        <h1
          className="text-6xl font-extrabold text-center drop-shadow-xl"
          style={{
            color: '#a7b8ff',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)',
          }}
        >
          BUMP
        </h1>
      </header>

      <header className="mb-4 flex justify-center">
        <h1
          className="text-2xl font-bold rounded-xl px-6 py-3 text-center shadow-lg backdrop-blur-md bg-white/30 border border-white/20 text-indigo-500"
          style={{ backgroundColor: '#a7b8ff' }}
        >
          {publicPlaylist ? publicPlaylist.name : 'Public Grooves'}
        </h1>
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
                playlistId={publicPlaylist ? publicPlaylist.id : ''}
                song={song}
                isCurrent={index === 0}
                onVote={() => publicPlaylist && fetchSongs(publicPlaylist.id)}
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

      {showAddSongForm && publicPlaylist && (
        <AddSongForm
          user={user}  // Added user prop here
          playlistId={publicPlaylist.id}
          onClose={() => setShowAddSongForm(false)}
          onAddSong={() => {
            fetchSongs(publicPlaylist.id);
            setShowAddSongForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;