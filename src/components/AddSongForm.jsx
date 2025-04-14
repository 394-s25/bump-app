// /src/components/AddSongForm.jsx
import React, { useState } from 'react';
import SongSearchItem from './SongSearchItem';

// This component now serves as a modal pop-up for adding a song. It includes a search bar that will eventually connect to the Spotify API
// and displays a dummy search result. The Cancel button closes the pop-up and the Add button submits the selected song info.
const AddSongForm = ({ onClose, onAddSong }) => {
  const [query, setQuery] = useState('');
  const [songInfo, setSongInfo] = useState(null);
  
  // Stub function that simulates searching songs via an API (e.g., Spotify API). 
  // Later, you can replace this with a real API call.
  const handleSearch = async () => {
    console.log('Searching for:', query);
    // Simulate an API response
    setSongInfo({
      title: query,
      artist: 'Sample Artist',
      album: 'Sample Album',
      image: 'https://via.placeholder.com/100'
    });
  };

  // Handle adding the song; you can later integrate with your Firebase backend.
  const handleAdd = async () => {
    if (!songInfo) {
      alert('Please search and select a song before adding.');
      return;
    }
    // Call the provided onAddSong function with song info if needed, then close the modal
    onAddSong(songInfo);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        background: 'white', padding: '20px', borderRadius: '8px',
        width: '400px', maxWidth: '90%'
      }}>
        <h2>Add a Song</h2>
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="search song names here"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flexGrow: 1, padding: '8px' }}
            required
          />
          <button onClick={handleSearch} style={{ marginLeft: '8px', padding: '8px 12px' }}>
            Search
          </button>
        </div>
        {songInfo && (
          <div style={{ marginBottom: '15px' }}>
            <SongSearchItem/>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px' }}>
            Cancel
          </button>
          <button onClick={handleAdd} style={{ padding: '8px 16px' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongForm;