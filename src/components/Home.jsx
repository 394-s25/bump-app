import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlaylist, getUserPlaylists } from '../Firebase/playlist';

const Home = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [userPlaylists, setUserPlaylists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!user?.uid) return;
      const playlists = await getUserPlaylists(user.uid);
      setUserPlaylists(playlists);
      setLoading(false);
    };
    fetchUserPlaylists();
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      setError('Please enter a name for your playlist.');
      return;
    }

    try {
      const playlistId = await createPlaylist(user.uid, playlistName.trim());
      navigate(`/dashboard?playlistId=${playlistId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create playlist. Please try again.');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading your playlists...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Welcome to BUMP!</h1>

      {userPlaylists.length > 0 && (
        <>
          <p className="mb-4 text-lg">Choose one of your playlists:</p>
          <ul className="mb-6 w-full max-w-md space-y-2">
            {userPlaylists.map((playlist) => (
              <li key={playlist.id}>
                <button
                  onClick={() => navigate(`/dashboard?playlistId=${playlist.id}`)}
                  className="w-full bg-white text-left px-4 py-2 rounded shadow hover:bg-blue-100"
                >
                  {playlist.name}
                </button>
              </li>
            ))}
          </ul>

          <hr className="my-4 w-full max-w-md border-gray-300" />
        </>
      )}

      <p className="mb-2 text-lg font-semibold">Create a new playlist:</p>
      <input
        type="text"
        placeholder="Enter playlist name"
        value={playlistName}
        onChange={(e) => {
          setPlaylistName(e.target.value);
          setError('');
        }}
        className="px-4 py-2 border border-gray-300 rounded mb-2 w-full max-w-md"
      />

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <button
        onClick={handleCreatePlaylist}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Create Playlist
      </button>
    </div>
  );
};

export default Home;
