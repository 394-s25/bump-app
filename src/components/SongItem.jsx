// // /src/components/SongItem.jsx
import React from 'react';
import { downvoteSong, upvoteSong } from '../Firebase/playlist';

const SongItem = ({ user, playlistId, song, onVote, isCurrent }) => {
  const placeholderImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDUqjRko7Ws05tXGYs6VXi40C2R4qo5dQdA&s"
  const placeholderUser = "unknown"
  const handleUpvote = async () => {
    try {
      await upvoteSong(user.uid, playlistId, song.id);
      onVote(); // re-fetch songs from dashboard
    } catch (error) {
      console.error('Error upvoting song:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      await downvoteSong(user.uid, playlistId, song.id);
      onVote(); // re-fetch songs from dashboard
    } catch (error) {
      console.error('Error downvoting song:', error);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg shadow-md border ${
        isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={song.image ? song.image : placeholderImage}
          alt={song.title}
          className="w-12 h-12 rounded object-cover"
        />
        <div>
          <p className="font-semibold text-sm">{song.songTitle} - {song.artist}</p>
          <p className="text-gray-500 text-xs">User: {song.user ? song.user : placeholderUser}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleUpvote}
          className="text-green-600 hover:text-green-800 text-xl"
        >
          ▲
        </button>
        <span className="font-medium w-5 text-center">{song.votes}</span>
        <button
          onClick={handleDownvote}
          className="text-red-600 hover:text-red-800 text-xl"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default SongItem;
