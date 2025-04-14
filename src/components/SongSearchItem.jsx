
// // /src/components/SongSearchItem.jsx
import React from 'react';

const SongSearchItem = () => {
  const songTitle = 'Song'
  const songArtist = 'Artist'
  const songImage = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDUqjRko7Ws05tXGYs6VXi40C2R4qo5dQdA&s";

  return (
    <div
      style={{ backgroundColor: '#fdf9e9' }}
      className={`flex items-center justify-between p-4 rounded-lg shadow-md border bg-white`}
    >
      <div className="flex items-center gap-3">
        <img
          // src={song.image ? song.image : placeholderImage}
          src={songImage}
          // alt={song.title}
          alt={songTitle}
          className="w-12 h-12 rounded object-cover"
        />
        <div>
          <p className="font-semibold text-sm">
            {/* {song.songTitle} - {song.artist} */}
            {songTitle} - {songArtist}
          </p>

        </div>
      </div>
    </div>
  );
};

export default SongSearchItem;



// // /src/components/SongSearchItem.jsx
// import React from 'react';

// const SongSearchItem = ({ track }) => {
//   // Extract required details from the raw Spotify track object.
//   const songTitle = track.name;
//   const albumName = track.album && track.album.name ? track.album.name : 'Unknown Album';
//   const artistName = track.artists && track.artists.length > 0 ? track.artists[0].name : 'Unknown Artist';
//   const albumImage =
//     track.album && track.album.images && track.album.images.length > 0
//       ? track.album.images[0].url
//       : 'https://via.placeholder.com/50'; // fallback image

//   return (
//     <div
//       style={{ backgroundColor: '#fdf9e9' }}
//       className="flex items-center justify-between p-4 rounded-lg shadow-md border bg-white border-gray-200"
//     >
//       <div className="flex items-center gap-3">
//         <img
//           src={albumImage}
//           alt={songTitle}
//           className="w-12 h-12 rounded object-cover"
//         />
//         <div>
//           <p className="font-semibold text-sm">
//             {songTitle} - {artistName}
//           </p>
//           <p className="text-gray-500 text-xs">
//             Album: {albumName}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SongSearchItem;