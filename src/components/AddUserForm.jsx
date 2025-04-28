// // /src/components/AddUserForm.jsx
import React, { useState } from 'react';
import { addUserToPlaylist } from '../Firebase/playlist.js';

const AddUserForm = ({ onClose, onAddUser, user, playlistId }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(''); // NEW: error state

  const handleInvite = async () => {
    try {
      await addUserToPlaylist(playlistId, query);
      setQuery('');
      setError(''); // clear error if successful
      onAddUser();
    } catch (error) {
      console.error("Error adding user to playlist:", error);
      setError("User not found. Please try again."); // SET error message
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }} className='text-black'>
      <div style={{
        background: 'white', padding: '20px', borderRadius: '8px',
        width: '400px', maxWidth: '90%'
      }}>
        <h2>Invite User</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search for user by username..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(''); // clear error when typing
            }}
            style={{ width: '100%', padding: '8px' }}
          />
          {error && (
            <div style={{ color: 'red', marginTop: '5px' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ marginRight: '10px', padding: '8px 16px' }}>
            Cancel
          </button>
          <button onClick={handleInvite} style={{ padding: '8px 16px' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;
