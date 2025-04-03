// /src/components/Playlist.jsx
import React, { useEffect, useState } from 'react';
import { getSongsForPlaylist } from '../Firebase/playlist';
import AddSongForm from './AddSongForm';
import SongItem from './SongItem';

const Playlist = ({ user, playlist }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (isExpanded) {
      async function fetchSongs() {
        try {
          const songsData = await getSongsForPlaylist(user.uid, playlist.id);
          setSongs(songsData);
        } catch (error) {
          console.error('Error fetching songs:', error);
        }
      }
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
              <SongItem key={song.id} user={user} playlistId={playlist.id} song={song} />
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