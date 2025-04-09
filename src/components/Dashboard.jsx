import React, { useCallback, useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { getSongsForPlaylist } from '../Firebase/playlist';
import MusicPlayer from './MusicPlayer';
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
    <div className="bg-lightBeige min-h-screen p-4" style={{ backgroundColor: '#fff7d5' }}>
      <header className="text-center mb-8">
        <h1 className="text-6xl font-extrabold text-center drop-shadow-xl" style={{ color: '#a7b8ff', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)'}} >BUMP </h1>
      </header>
      <header className="mb-4 flex justify-center">
        <h1 className="text-2xl font-bold rounded-xl px-6 py-3 text-center shadow-lg backdrop-blur-md bg-white/30 border border-white/20 text-indigo-500" style={{ backgroundColor: '#a7b8ff' }}>My Groove - Road Trip</h1>
      </header>
      <div className="space-y-4 pb-20">
        <FlipMove>
          {songs.map((song, index) => (
            <div key={song.id} className = 'mb-4 mt-4'>
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
