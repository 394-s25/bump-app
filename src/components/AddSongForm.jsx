import React, { useEffect, useState } from 'react';
import SongSearchItem from './SongSearchItem';

// This component now serves as a modal pop-up for adding a song. It connects to the Spotify API search endpoint (/api/search) 
// and displays live search results as the user types. Once a song is clicked, that result is selected, and the search block is replaced
// with the selected song information.
const AddSongForm = ({ onClose, onAddSong }) => {
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
      const response = await fetch(`http://127.0.0.1:5000/search?q=${encodeURIComponent(query)}&limit=10`);
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

  // Handle adding the song; you can later integrate with your Firebase backend
  const handleAdd = () => {
    if (!selectedSong) {
      alert('Please search and select a song before adding.');
      return;
    }
    onAddSong(selectedSong);
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
        {!selectedSong ? (
          <div style={{ marginBottom: '15px' }}>
            <input
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
                    <SongSearchItem track={track} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            <p>Selected Song:</p>
            <SongSearchItem track={selectedSong} />
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