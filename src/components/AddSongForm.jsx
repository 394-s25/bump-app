// /src/components/AddSongForm.jsx
import React, { useState } from 'react';
import { uploadSong } from '../Firebase/playlist';

const AddSongForm = ({ user, playlistId }) => {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await uploadSong(user.uid, playlistId, songTitle, artist);
      setSongTitle('');
      setArtist('');
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Song Title"
        value={songTitle}
        onChange={(e) => setSongTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        required
      />
      <button type="submit">Add Song</button>
    </form>
  );
};

export default AddSongForm;