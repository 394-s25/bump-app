// /src/components/SongItem.jsx
import React, {useState} from 'react';
import { downvoteSong, upvoteSong } from '../Firebase/playlist';

const SongItem = ({ user, playlistId, song }) => {
  const [votes, setVotes] = useState(song.votes || 0);
  const handleUpvote = async () => {
    try {
      setVotes(votes + 1);
      await upvoteSong(user.uid, playlistId, song.id);
    } catch (error) {
      console.error('Error upvoting song:', error);
      setVotes(votes - 1); // Revert the vote count if there's an error
    }
  };

  const handleDownvote = async () => {
    try {
      setVotes(votes - 1);
      await downvoteSong(user.uid, playlistId, song.id);
    } catch (error) {
      console.error('Error downvoting song:', error);
      setVotes(votes + 1); // Revert the vote count if there's an error
    }
  };

  return (
    <div
      className={'flex items-center justify-between p-4 rounded-md shadow-sm border transition-all'}
    >
      <img src={song.image} alt={song.title} className="w-16 h-16 rounded object-cover" />
      <div className="ml-4 flex-grow">
        <h2 className="text-md font-semibold">{song.title}</h2>
        <p className="text-xs text-gray-500">User: {song.user}</p>
      </div>
      <div className="flex items-center">
        <button
          onClick={handleUpvote}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          ▲
        </button>
        <span className="mx-2 font-semibold">{votes}</span>
        <button
          onClick={handleDownvote}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default SongItem;