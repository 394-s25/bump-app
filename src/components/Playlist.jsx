// /src/components/Playlist.jsx
import React, { useEffect, useState } from 'react';
import { getSongsForPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import SongItem from './SongItem';

const Playlist = ({ user, playlist }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songs, setSongs] = useState([]);

  // Retrieve and update songs for the given playlist.
  const fetchSongs = async () => {
    try {
      // Now, getSongsForPlaylist only requires the playlist's ID.
      const songsData = await getSongsForPlaylist(playlist.id);
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
  }, [isExpanded, playlist.id]);

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
                onVote={fetchSongs}  // callback to refresh songs after voting
              />
            ))
          ) : (
            <p>No songs in this playlist yet.</p>
          )}
          <AddSongForm 
            user={user} 
            playlistId={playlist.id} 
            onClose={() => {}} 
            onAddSong={fetchSongs} 
          />
        </div>
      )}
    </div>
  );
};

export default Playlist;