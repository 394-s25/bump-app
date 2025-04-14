import React, { useCallback, useEffect, useState } from 'react';
import FlipMove from 'react-flip-move';
import { getSongsForPlaylist } from '../Firebase/playlist';
import MusicPlayer from './MusicPlayer';
import SongItem from './SongItem';

const Dashboard = ({ user }) => {
  const playlistId = 'HaZFJWwiSRxf2cgouR9i';
  const [songs, setSongs] = useState([]);

  const [searchResults, setSearchResults] = useState([]);

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

  // Search for songs with album cover art
  async function searchSongs(query) {
    const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    console.log(data.results); // Output the results for debugging

    setSearchResults(data.results); // Set search results
  }

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
{/* Search input */}
<div className="mb-4">
        <input
          type="text"
          placeholder="Search for songs..."
          onChange={(e) => searchSongs(e.target.value)}
          className="w-full p-2 rounded border"
        />
      </div>

      {/* Display search results */}
      <div className="space-y-4 pb-20">
        <FlipMove>
          {searchResults.map((song, index) => (
            <div key={song.spotify_url} className="mb-4 mt-4 flex items-center">
              {/* Display song name and album cover */}
              <img src={song.cover} alt={song.name} className="w-12 h-12 mr-4 rounded" />
              <div>
                <h3 className="text-xl font-semibold">{song.name}</h3>
                <p className="text-sm text-gray-500">{song.artist} - {song.album}</p>
              </div>
            </div>
          ))}
        </FlipMove>
      </div>



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
