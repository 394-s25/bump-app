import React, { useState } from 'react';
import {CiPlay1, CiPause1, CiVolumeHigh, CiCircleChevRight } from 'react-icons/ci';

const MusicPlayer = ({song}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-black px-6 py-4 flex items-center justify-between z-50 border-t shadow-md" style={{ backgroundColor: '#a7b8ff' }}>

      <section className="flex items-center gap-4 min-w-[250px]" >
        <img
          src={song.image}
          alt={song.songTitle}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{song.songTitle} - {song.artist}</p>
          <p className="text-sm text-gray-500">Added by: {song.user}</p>
        </div>
      </section>

      <section className="flex flex-col items-center flex-1 max-w-xl mx-8" >
        <div className="flex items-center gap-4 mb-1">
          <button onClick={togglePlay} className="text-black text-2xl mb-3 mt-3">
            {isPlaying ? <CiPause1 size={28} /> : <CiPlay1 size={28} />}
          </button>
          <button className="text-black text-2xl mb-3 mt-3" >
            <CiCircleChevRight size={28} />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500">0:00</span>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full accent-gray"
          />
          <span className="text-xs text-gray-500">2:10</span>
        </div>
      </section>

      <section className="hidden md:flex items-center gap-3 min-w-[100px]">
        <CiVolumeHigh size={28} className="text-black" />
        <input
          type="range"
          min="0"
          max="100"
          className="w-24 accent-gray"
        />
      </section>
    </div>
  );
};

export default MusicPlayer;
