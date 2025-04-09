// // /src/components/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { getSongsForPlaylist } from '../Firebase/playlist';
import SongItem from './SongItem';
import FlipMove from 'react-flip-move';
import MusicPlayer from './MusicPlayer';

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
    <div className="bg-lightBeige min-h-screen p-4" style={{ backgroundColor: '#FAF9F6' }}>
      <header className="text-center mb-8">
        <h1 className="text-6xl font-extrabold text-center drop-shadow-xl" style={{ color: '#a7b8ff', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)'}} >BUMP </h1>
      </header>
      <header className="mb-4 flex justify-center">
        <h1 className="text-2xl font-bold rounded-xl px-6 py-3 text-center shadow-lg backdrop-blur-md bg-white/30 border border-white/20" style={{ backgroundColor: '#a7b8ff' }}>My Groove - Road Trip</h1>
      </header>
      <div className="space-y-4">
        <FlipMove>
          {songs.map((song, index) => (
            <div key={song.id}>
              <SongItem
                user={user}
                playlistId={playlistId}
                song={song}
                isCurrent={index === 0}
                onVote={fetchSongs}
              />
            </div>
          ))}
        </FlipMove>
      </div>
      <MusicPlayer
        song={songs.length > 0 ? songs[0] : { image: '', songTitle: '', artist: '', user: '' }} // Placeholder if no songs
    />
    </div>
  );
};



export default Dashboard;
