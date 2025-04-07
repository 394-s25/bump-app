// // /src/components/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getSongsForPlaylist } from '../Firebase/playlist';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const playlistId = 'HaZFJWwiSRxf2cgouR9i';
  const [songs, setSongs] = useState([]);

  // Fetch and sort songs
  const fetchSongs = useCallback(async () => {
    try {
      const songsData = await getSongsForPlaylist(user.uid, playlistId);
      const sortedSongs = songsData.sort((a, b) => b.votes - a.votes);
      setSongs(sortedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchSongs(); // initial load
  }, [fetchSongs]);

  return (
    <div className="container mx-auto p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bump</h1>
      </header>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">My Groove - Road Trip</h1>
      </header>

      <div className="space-y-4">
        {songs.map((song, index) => (
          <SongItem
            key={song.id}
            user={user}
            playlistId={playlistId}
            song={song}
            isCurrent={index === 0}
            onVote={fetchSongs} // re-fetch and sort on vote
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
