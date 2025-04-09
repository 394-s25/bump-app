// /src/components/Playlist.jsx
import React, { useEffect, useState } from 'react';
import { getSongsForPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import SongItem from './SongItem';

const Playlist = ({ user, playlist }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songs, setSongs] = useState([]);

  // Define fetchSongs as a callback to retrieve and update songs.
  const fetchSongs = async () => {
    try {
      const songsData = await getSongsForPlaylist(user.uid, playlist.id);
      const sortedSongs = [...songsData].sort((a, b) => b.votes - a.votes);
      setSongs(sortedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  // Trigger fetchSongs when the playlist expands.
  useEffect(() => {
    if (isExpanded) {
      fetchSongs();
    }
  }, [isExpanded, user.uid, playlist.id]);

  return (
    <div className="playlist">
      <h2 onClick={() => setIsExpanded(!isExpanded)}>
        {playlist.name} {isExpanded ? '-' : '+'}
      </h2>
      {isExpanded && (
        <div>
          {songs.length ? (
            songs.map((song) => (
              <SongItem
                key={song.id}
                user={user}
                playlistId={playlist.id}
                song={song}
                onVote={fetchSongs}  // Pass the callback to SongItem
              />
            ))
          ) : (
            <p>No songs in this playlist yet.</p>
          )}
          <AddSongForm user={user} playlistId={playlist.id} />
        </div>
      )}
    </div>
  );
};

export default Playlist;