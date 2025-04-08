import React, { useState } from 'react';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

const MusicPlayer = ({ currentSong }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-black px-6 py-4 flex items-center justify-between z-50 border-t">

      <section className="flex items-center gap-4 min-w-[250px]">
        <img
          src={currentSong.image}
          alt={currentSong.title}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{currentSong.title}</p>
          <p className="text-sm text-gray-500">{currentSong.user}</p>
        </div>
      </section>

      <section className="flex flex-col items-center flex-1 max-w-xl mx-8">
        <div className="flex items-center gap-4 mb-1">
          <button onClick={togglePlay} className="text-black text-2xl mb-3 mt-3">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="text-xs text-gray-500">0:00</span>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full accent-black"
          />
          <span className="text-xs text-gray-500">2:10</span>
        </div>
      </section>

      <section className="hidden md:flex items-center gap-3 min-w-[100px]">
        <FaVolumeUp className="text-black" />
        <input
          type="range"
          min="0"
          max="100"
          className="w-24 accent-black"
        />
      </section>
    </div>
  );
};

export default MusicPlayer;
