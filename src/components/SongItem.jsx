// /src/components/SongItem.jsx
import React, { useEffect, useState } from 'react';
import { CiSquareChevDown, CiSquareChevUp } from 'react-icons/ci';
import { cancelVoteSong, downvoteSong, upvoteSong } from '../Firebase/playlist';

const SongItem = ({ user, playlistId, song, onVote, isCurrent }) => {
  const voteInfo = `uservote_${song.id}`;

  // State to track the user's vote
  const [userVote, setUserVote] = useState(null);

  // Placeholder data
  const placeholderImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDUqjRko7Ws05tXGYs6VXi40C2R4qo5dQdA&s";
  const placeholderUser = "unknown";

  // Fetch the user's vote from localStorage when component mounts
  useEffect(() => {
    const storedVote = localStorage.getItem(voteInfo);
    if (storedVote) {
      setUserVote(storedVote);
    }
  }, [song.id, voteInfo]);

  const handleUpvote = async () => {
    try {
      if (userVote === 'upvote') {
        // Cancel the upvote if already upvoted.
        await cancelVoteSong(playlistId, song.id, 'upvote');
        localStorage.removeItem(voteInfo);
        setUserVote(null);
        onVote(); // Re-fetch or update songs.
      } else {
        // If the user had downvoted, remove that vote first.
        if (userVote === 'downvote') {
          await cancelVoteSong(playlistId, song.id, 'downvote');
          localStorage.removeItem(voteInfo);
          setUserVote(null);
        }
        // Proceed with upvote.
        await upvoteSong(playlistId, song.id);
        localStorage.setItem(voteInfo, 'upvote');
        setUserVote('upvote');
        onVote();
      }
    } catch (error) {
      console.error('Error handling upvote:', error);
    }
  };

  const handleDownvote = async () => {
    try {
      if (userVote === 'downvote') {
        // Cancel the downvote if already downvoted.
        await cancelVoteSong(playlistId, song.id, 'downvote');
        localStorage.removeItem(voteInfo);
        setUserVote(null);
        onVote();
      } else {
        // If the user had upvoted, remove that vote first.
        if (userVote === 'upvote') {
          await cancelVoteSong(playlistId, song.id, 'upvote');
          localStorage.removeItem(voteInfo);
          setUserVote(null);
        }
        // Proceed with downvote.
        await downvoteSong(playlistId, song.id);
        localStorage.setItem(voteInfo, 'downvote');
        setUserVote('downvote');
        onVote();
      }
    } catch (error) {
      console.error('Error handling downvote:', error);
    }
  };

  return (
    <div
      // style={{ backgroundColor: '#fdf9e9 dark:#2C3A4D' }} 
      className={`flex items-center justify-between p-4 rounded-lg shadow-md border bg-lightBeige2 dark:bg-darkBg2 ${
        isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={song.image ? song.image : placeholderImage}
          alt={song.songTitle}
          className="w-12 h-12 rounded object-cover"
        />
        <div>
          <p className="font-semibold text-sm dark:text-white">
            {song.songTitle} - {song.artist}
          </p>
          <p className="text-gray-500 dark:text-blue-300 text-xs">
            User: {song.user ? song.user : placeholderUser}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-bold">
        <button
          onClick={handleUpvote}
          className={`text-xl ${userVote === 'upvote' ? 'text-green-600' : 'text-gray-400'} ${userVote === 'upvote' ? 'hover:text-green-800' : 'hover:text-green-600'}`}
        >
          <CiSquareChevUp size={42} />
        </button>
        <span className="w-5 text-center text-lg">{song.votes}</span>
        <button
          onClick={handleDownvote}
          className={`text-xl ${userVote === 'downvote' ? 'text-red-600' : 'text-gray-400'} ${userVote === 'downvote' ? 'hover:text-red-800' : 'hover:text-red-600'}`}
        >
          <CiSquareChevDown size={42} />
        </button>
      </div>
    </div>
  );
};

export default SongItem;