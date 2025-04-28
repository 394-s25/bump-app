// src/components/CreatePlaylistModal.jsx
import React, { useState } from 'react';
import { createPlaylist } from '../Firebase/playlist';

const CreatePlaylistModal = ({ user, onClose, onCreate }) => {
  const [playlistName, setPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      setError("Playlist name cannot be empty.");
      return;
    }
    try {
      const newPlaylistId = await createPlaylist(user.uid, playlistName, []);
      // Pass both the newPlaylistId and playlist data so the dashboard can update correctly.
      onCreate(newPlaylistId, { name: playlistName, isPublic, sharedWith: [] });
      onClose();
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError("Error creating playlist.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Create a Playlist</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Playlist Name</label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleCreate} className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;