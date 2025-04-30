// src/components/Profile.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSongCountsForUser } from '../Firebase/playlist';

const Profile = ({ user }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      getSongCountsForUser(user.uid)
        .then(setStats)
        .catch(err => console.error('Stats error:', err));
    }
  }, [user]);

  if (!user) return <p className="p-4">Please log in.</p>;

  return (
    <div
      className="min-h-screen p-6 bg-white text-black dark:bg-darkBg dark:text-blue-300"
    >
      {/* back‑to‑dashboard */}
      <Link
        to="/"
        className="inline-block mb-4 text-indigo-600 underline text-sm"
      >
        ← Back to Dashboard
      </Link>

      <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Username:</strong> {user.username || user.displayName || '—'}</p>

      <h3 className="text-xl font-semibold mt-6 mb-2">Your Playlists</h3>
      {!stats && <p>Loading…</p>}
      {stats && (
        <ul className="list-disc pl-6 space-y-1">
          {Object.entries(stats).map(([id, { name, count }]) => (
            <li key={id}>
              {name} — {count} song{count !== 1 ? 's' : ''}
            </li>
          ))}
          {Object.keys(stats).length === 0 && <li>You don’t own any playlists yet.</li>}
        </ul>
      )}
    </div>
  );
};

export default Profile;