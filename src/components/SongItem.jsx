
// // /src/components/SongItem.jsx
import React, { useEffect, useState } from 'react';
import {CiSquareChevUp, CiSquareChevDown } from 'react-icons/ci';
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
        await cancelVoteSong(user.uid, playlistId, song.id, 'upvote');
        localStorage.removeItem(voteInfo);
        setUserVote(null);
        onVote(); // Re-fetch or update songs.
      } else {
        // If the user had downvoted, remove that vote first.
        if (userVote === 'downvote') {
          await cancelVoteSong(user.uid, playlistId, song.id, 'downvote');
          localStorage.removeItem(voteInfo);
          setUserVote(null);
        }
        // Proceed with upvote.
        await upvoteSong(user.uid, playlistId, song.id);
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
        await cancelVoteSong(user.uid, playlistId, song.id, 'downvote');
        localStorage.removeItem(voteInfo);
        setUserVote(null);
        onVote();
      } else {
        // If the user had upvoted, remove that vote first.
        if (userVote === 'upvote') {
          await cancelVoteSong(user.uid, playlistId, song.id, 'upvote');
          localStorage.removeItem(voteInfo);
          setUserVote(null);
        }
        // Proceed with downvote.
        await downvoteSong(user.uid, playlistId, song.id);
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
          <p className="font-semibold text-sm">
            {song.songTitle} - {song.artist}
          </p>
          <p className="text-gray-500 text-xs">
            User: {song.user ? song.user : placeholderUser}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-bold">
        <button
          onClick={handleUpvote}
          className={`text-xl ${userVote === 'upvote' ? 'text-green-800' : 'text-green-600'} hover:text-green-800`}
        >
          <CiSquareChevUp size={28}/>
        </button>
        <span className="w-5 text-center">{song.votes}</span>
        <button
          onClick={handleDownvote}
          className={`text-xl ${userVote === 'downvote' ? 'text-red-800' : 'text-red-600'} hover:text-red-800`}
        >
          <CiSquareChevDown size={28}/>
        </button>
      </div>
    </div>
  );
};

export default SongItem;