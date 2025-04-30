// src/components/PlaylistDropdown.jsx

import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineQueueMusic } from 'react-icons/md';
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
  const dropdownRef = useRef(null);

  // Fixed infinite loop
  useEffect(() => {
    const fetchMissingUsernames = async () => {
      const missing = playlists.filter(
        (pl) => pl.ownerId !== user.uid && !ownerUsernames[pl.ownerId]
      );
      if (missing.length === 0) return;
  
      const updated = { ...ownerUsernames };
      let updatedFlag = false;
  
      for (const pl of missing) {
        try {
          const data = await getUserProfile(pl.ownerId);
          updated[pl.ownerId] = data.username;
        } catch {
          updated[pl.ownerId] = 'unknown';
        }
        updatedFlag = true;
      }
  
      if (updatedFlag) {
        setOwnerUsernames(updated);
      }
    };
  
    fetchMissingUsernames();
  }, [playlists, user.uid]);
  
  useEffect(() => {
    if (onOpenChange) onOpenChange(dropdownOpen);
  }, [dropdownOpen, onOpenChange]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggle = async () => {
    const newState = !dropdownOpen;
    setDropdownOpen(newState);
    if (newState && user) {
      try {
        const owned  = await getUserPlaylists(user.uid);
        const shared = await getSharedPlaylists(user.uid);


        // const pub = await getPublicPlaylists();
        const combined = [
          ...owned,
          ...shared,
          // ...pub.filter((pl) => pl.ownerId !== user.uid),
        ];
        const unique = Array.from(
          new Map(combined.map((pl) => [pl.id, pl])).values()
        ).sort((a, b) => a.name.localeCompare(b.name));
        setPlaylists(unique);
      } catch (err) {
        console.error('Playlist refresh error:', err);
      }
    }
  };

  return (
    <div ref={dropdownRef} className="flex justify-center m-4">
      <button
        type="button"
        onClick={toggle}
        aria-label="Select Playlist"
        className="
          inline-flex items-center justify-center w-10 h-10 rounded-full
          border border-gray-300 shadow-sm
          bg-blue-300 text-white hover:bg-blue-400 focus:outline-none
          dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-gray-600
        "
      >
        <MdOutlineQueueMusic className="w-5 h-5" />
      </button>

      {dropdownOpen && (
        <div
          className="
            absolute left-0 right-0 mt-2 mx-auto max-w-xs w-full
            rounded-md shadow-lg
            ring-1 ring-black ring-opacity-5 z-50
            bg-white dark:bg-darkCard
          "
        >
          <div className="py-1 max-h-60 overflow-y-auto overscroll-contain">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => {
                  onSelectPlaylist(pl);
                  setDropdownOpen(false);
                }}
                className="
                  w-full text-left px-4 py-2 text-sm
                  text-gray-700 hover:bg-gray-100
                  dark:text-darkText dark:hover:bg-gray-700
                "
              >
                <div className="flex justify-between">
                  <span>{pl.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {
                      pl.ownerId === user.uid
                      ? 'by you'
                      : `by ${ownerUsernames[pl.ownerId] || '...'}`
                    }
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-blue-300 dark:border-gray-600">
            <button
              onClick={() => {
                onSelectPlaylist('create');
                setDropdownOpen(false);
              }}
              className="
                w-full text-left text-sm font-semibold hover:underline
                text-blue-300 dark:text-blue-400
              "
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
