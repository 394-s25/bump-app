// src/components/Dashboard.jsx
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { db } from '../Firebase/firebaseConfig';
import { getPublicPlaylists } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import MusicPlayer from './MusicPlayer';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const [publicPlaylist, setPublicPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showAddSongForm, setShowAddSongForm] = useState(false);

  // Fetch all public playlists and pick one (here, the first one).
  const fetchPublicPlaylist = useCallback(async () => {
    try {
      const publicPlaylists = await getPublicPlaylists();
      if (publicPlaylists.length > 0) {
        const defaultPublicPlaylist = publicPlaylists[0];
        setPublicPlaylist(defaultPublicPlaylist);
      } else {
        console.log('No public playlists found');
      }
    } catch (error) {
      console.error('Error fetching public playlists:', error);
    }
  }, []);

  useEffect(() => {
    fetchPublicPlaylist();
  }, [fetchPublicPlaylist]);

  // Set up a real-time listener for songs when publicPlaylist is ready.
  useEffect(() => {
    if (publicPlaylist) {
      // Create a query on the songs collection; we order by timestamp (or votes) if needed.
      const songsQuery = query(
        collection(db, "playlists", publicPlaylist.id, "songs"),
        orderBy("timestamp", "desc")
      );
      // Subscribe to onSnapshot for real-time updates.
      const unsubscribe = onSnapshot(songsQuery, (querySnapshot) => {
        const updatedSongs = [];
        querySnapshot.forEach(doc => {
          updatedSongs.push({ id: doc.id, ...doc.data() });
        });
        setSongs(updatedSongs);
      }, (error) => {
        console.error("Error listening to songs:", error);
      });
      // Unsubscribe when the component unmounts or publicPlaylist changes.
      return () => unsubscribe();
    }
  }, [publicPlaylist]);

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

      {showAddSongForm && publicPlaylist && (
        <AddSongForm
          user={user}
          playlistId={publicPlaylist.id}
          onClose={() => setShowAddSongForm(false)}
          onAddSong={() => setShowAddSongForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;