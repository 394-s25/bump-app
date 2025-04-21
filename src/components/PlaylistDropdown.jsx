// src/components/PlaylistDropdown.jsx
import React, { useEffect, useState } from 'react';
import { getPublicPlaylists, getSharedPlaylists, getUserPlaylists } from '../Firebase/playlist';

const PlaylistDropdown = ({ user, selectedPlaylist, onSelectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch playlists accessible to the user.
  const fetchAccessiblePlaylists = async () => {
    try {
      const owned = await getUserPlaylists(user.uid);
      const shared = await getSharedPlaylists(user.uid);
      const publicList = await getPublicPlaylists();
      // Filter public playlists to include only those NOT owned by the user.
      const publicFiltered = publicList.filter(pl => pl.ownerId !== user.uid);
      // Combine and deduplicate by id.
      const combinedMap = new Map();
      [...owned, ...shared, ...publicFiltered].forEach(pl => {
        combinedMap.set(pl.id, pl);
      });
      const combined = Array.from(combinedMap.values());
      // Sort alphabetically
      combined.sort((a, b) => a.name.localeCompare(b.name));
      setPlaylists(combined);
    } catch (error) {
      console.error("Error fetching accessible playlists:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccessiblePlaylists();
    }
  }, [user]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setDropdownOpen(prev => !prev)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {selectedPlaylist ? selectedPlaylist.name : "Select Playlist"}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{ zIndex: 1000 }}
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => {
                  onSelectPlaylist(playlist);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex justify-between">
                  <span>{playlist.name}</span>
                  <span className="text-xs text-gray-500">
                    {playlist.isPublic ? "Public" : (playlist.ownerId === user.uid ? "by you" : `by ${playlist.ownerId}`)}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <button
              type="button"
              onClick={() => {
                onSelectPlaylist("create");
                setDropdownOpen(false);
              }}
              className="w-full text-left text-sm text-indigo-600 font-semibold hover:underline"
            >
              Create a Playlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDropdown;