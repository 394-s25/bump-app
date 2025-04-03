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
    <div>
      <h1>Dashboard</h1>
      {playlists.length ? (
        playlists.map((playlist) => (
          <Playlist key={playlist.id} user={user} playlist={playlist} />
        ))
      ) : (
        <p>No playlists found.</p>
      )}
    </div>
  );
};

export default Dashboard;