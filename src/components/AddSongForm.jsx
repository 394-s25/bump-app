// /src/components/AddSongForm.jsx
import React, { useEffect, useState } from 'react';
import { uploadSong } from '../Firebase/playlist';
import SongSearchItem from './SongSearchItem';

const AddSongForm = ({ onClose, onAddSong, user, playlistId }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  // Function that calls the backend API to fetch tracks from Spotify
  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `https://flask-api-416502417253.us-central1.run.app/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      // Use the 'results' key from your Flask response
      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  // Debounced search: trigger search 300ms after the user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle when a user selects a song from search results
  const handleSongSelect = (track) => {
    setSelectedSong(track);
    setSearchResults([]);
    setQuery('');
  };

  // Handle adding the song. Notice that we are now using the passed in playlistId and user.
  const handleAdd = async () => {
    if (!selectedSong) {
      alert('Please search and select a song before adding.');
      return;
    }
    try {
      onAddSong(); // callback to refresh songs list
      await uploadSong(
        playlistId,
        selectedSong.artist,
        selectedSong.cover,
        selectedSong.name,
        user?.username || user?.email || "Unknown"
      );
      console.log(selectedSong);
    } catch (error) {
      console.error("Error adding song to Firebase:", error);
    }
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
        <h2 className='text-black'>Add a Song</h2>
        {!selectedSong ? (
          <div style={{ marginBottom: '15px' }}>
            <input
              className='text-black'
              type="text"
              placeholder="Search for songs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
            {searchResults.length > 0 && (
              <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {searchResults.map((track, index) => (
                  <div key={track.spotify_url || index} onClick={() => handleSongSelect(track)} style={{ cursor: 'pointer' }}>
                    <SongSearchItem track={track}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }} className='text-black'>
            <p>Selected Song:</p>
            <SongSearchItem track={selectedSong} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className='text-black' onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px' }}>
            Cancel
          </button>
          <button className='text-black' onClick={handleAdd} style={{ padding: '8px 16px' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongForm;