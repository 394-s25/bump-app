// /src/components/SongItem.jsx
import React from 'react';
import { downvoteSong, upvoteSong } from '../Firebase/playlist';

const SongItem = ({ user, playlistId, song }) => {
  const handleUpvote = async () => {
    try {
      await upvoteSong(user.uid, playlistId, song.id);
    } catch (error) {
      console.error('Error upvoting song:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      await downvoteSong(user.uid, playlistId, song.id);
    } catch (error) {
      console.error('Error downvoting song:', error);
    }
  };

  return (
    <div className="song-item">
      <span>{song.songTitle} - {song.artist}</span>
      <div>
        <button onClick={handleUpvote}>▲</button>
        <span>{song.votes}</span>
        <button onClick={handleDownvote}>▼</button>
      </div>
    </div>
  );
};

export default SongItem;