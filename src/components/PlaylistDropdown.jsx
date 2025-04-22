// src/components/PlaylistDropdown.jsx
import React, { useEffect, useState } from 'react';
import {
  getPublicPlaylists,
  getSharedPlaylists,
  getUserPlaylists,
} from '../Firebase/playlist';

import { getUserProfile } from '../Firebase/user';

/**
 * Props:
 *  user                – current user
 *  selectedPlaylist    – object | null
 *  onSelectPlaylist    – fn(playlist | 'create')
 *  onOpenChange        – fn(isOpen:boolean)  ← notifies parent
 */
const PlaylistDropdown = ({
  user,
  selectedPlaylist,
  onSelectPlaylist,
  onOpenChange,
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ownerUsernames, setOwnerUsernames] = useState({});

  useEffect(() => {
    const fetchMissingUsernames = async () => {
      const missing = playlists.filter(pl =>
        pl.ownerId !== user.uid && !ownerUsernames[pl.ownerId]
      );
  
      const updated = { ...ownerUsernames };
      for (const pl of missing) {
        try {
          const data = await getUserProfile(pl.ownerId);
          updated[pl.ownerId] = data.username;
        } catch (err) {
          updated[pl.ownerId] = 'unknown';
        }
      }
  
      setOwnerUsernames(updated);
    };
  
    fetchMissingUsernames();
  }, [playlists]);
  
  /** fetch accessible playlists */
  /** notify parent of open / close */
  useEffect(() => {
    if (onOpenChange) onOpenChange(dropdownOpen);
  }, [dropdownOpen, onOpenChange]);

  /** toggle helper */
  const toggle = async () => {
    const newState = !dropdownOpen;
    setDropdownOpen(newState);
    
    if (newState && user) {
      try {
        const owned = await getUserPlaylists(user.uid);
        const shared = await getSharedPlaylists(user.uid);
        const pub = await getPublicPlaylists();
        const combined = [
          ...owned,
          ...shared,
          ...pub.filter(pl => pl.ownerId !== user.uid),
        ];
        const unique = Array.from(
          new Map(combined.map(pl => [pl.id, pl])).values(),
        ).sort((a, b) => a.name.localeCompare(b.name));
        setPlaylists(unique);
      } catch (err) {
        console.error('Playlist refresh error:', err);
      }
    }
  };
  
  return (
    <div className="relative max-w-xs w-full">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex justify-between w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        {selectedPlaylist ? selectedPlaylist.name : 'Select Playlist'}
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          className="absolute left-0 right-0 mt-2 mx-auto max-w-xs w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1 max-h-60 overflow-y-auto overscroll-contain">
            {playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => {
                  onSelectPlaylist(pl);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex justify-between">
                  <span>{pl.name}</span>
                  <span className="text-xs text-gray-500">
                    {pl.isPublic
                      ? 'Public'
                      : pl.ownerId === user.uid
                      ? 'by you'
                      : `by ${ownerUsernames[pl.ownerId] || '...'}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <button
              onClick={() => {
                onSelectPlaylist('create');
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