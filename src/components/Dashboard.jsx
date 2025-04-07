// /src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getUserPlaylists } from '../Firebase/playlist';
import Playlist from './Playlist';
import SongItem from './SongItem';

const initialSongs = [
  {
    id: 1,
    title: 'Willow – Taylor Swift',
    user: 'Ray',
    image: 'https://i.imgur.com/1ZQZ1Z2.jpg',
    votes: 4,
  }];

const Dashboard = ({ user }) => {
  // const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState(initialSongs);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const data = await getUserPlaylists(user.uid);
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    }
    fetchPlaylists();
  }, [user.uid]);

  return (
    <div className="container mx-auto p-4">
      <header className = "text-center mb-8">
        <h1 className="text-3xl font-bold">Bump</h1>
      </header>
      <header className=" mb-4">
        <h1 className="text-2xl font-bold">My Groove - Road Trip</h1>
      </header>

      <div className = "space-y-4">
        {songs.map((song) => (
          <SongItem
            key={song.id}
            user={user}
            playlistId={song.playlistId}
            song={song}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;