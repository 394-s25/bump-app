// /src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { getUserPlaylists } from '../Firebase/playlist';
import Playlist from './Playlist';

const Dashboard = ({ user }) => {
  const [playlists, setPlaylists] = useState([]);

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
      <h1 className="text-3xl font-bold mb-4">My Groove</h1>
      {playlists.length ? (
        playlists.map((playlist) => (
          <div key={playlist.id} className="mb-2">
            <h2 className="text-xl">{playlist.name}</h2>
            <Playlist user={user} playlist={playlist} />
          </div>
        ))
      ) : (
        <p className="text-gray-500">No playlists found.</p>
      )}
    </div>
  );
};

export default Dashboard;