// /src/components/SongSearchItem.jsx
import React from 'react';

const SongSearchItem = ({ track }) => {
  const songTitle = track.name;
  const albumName = track.album || 'Unknown Album';
  const artistName = track.artist || 'Unknown Artist';
  const albumImage = track.cover || 'https://via.placeholder.com/50'; // fallback image

  return (
    <div
      style={{ backgroundColor: '#fdf9e9', cursor: 'pointer' }}
      className="flex items-center justify-between p-4 rounded-lg shadow-md border bg-white border-gray-200"
    >
      <div className="flex items-center gap-3">
        <img
          src={albumImage}
          alt={songTitle}
          className="w-12 h-12 rounded object-cover"
        />
        <div>
          <p className="font-semibold text-sm">
            {songTitle} - {artistName}
          </p>
          <p className="text-gray-500 text-xs">
            Album: {albumName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SongSearchItem;