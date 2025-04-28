import React from 'react';
import { CiCircleChevRight, CiPause1, CiPlay1, CiVolumeHigh } from 'react-icons/ci';

const MusicPlayer = ({
  song, 
  isPlaying = false, 
  togglePlay, 
  nextTrack,
  volume = 50,
  onVolumeChange,
  position = 0,
  duration = 100,
  onSeek,
  formatTime
}) => {
  
  const handleVolumeChange = (e) => {
    if (onVolumeChange) {
      onVolumeChange(parseInt(e.target.value));
    }
  };

  const handleSeek = (e) => {
    if (onSeek) {
      onSeek(parseInt(e.target.value));
    }
  };

  const currentTime = formatTime ? formatTime(position) : '0:00';
  const totalTime = formatTime ? formatTime(duration) : '0:00';

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
          <button className="text-black text-2xl mb-3 mt-3" onClick={nextTrack}>
            <CiCircleChevRight size={28} />
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 w-full">
          <span className="text-xs text-black">{currentTime}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration > 0 ? (Math.min(position, duration) * 100 / duration) : 0}
            onChange={handleSeek}
            className="w-full accent-yellow-50"
          />
          <span className="text-xs text-black">{totalTime}</span>
        </div>
      </section>

      <section className="hidden md:flex items-center gap-3 min-w-[100px]">
        <CiVolumeHigh size={28} className="text-black" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 accent-yellow-50"
          style = {{ background: '#fff' }}
        />
      </section>
    </div>
  );
};

export default MusicPlayer;