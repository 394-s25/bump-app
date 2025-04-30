import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSongCountsForUser } from '../Firebase/playlist';
import { LuUser } from 'react-icons/lu';

const Profile = ({ user }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      getSongCountsForUser(user.uid)
        .then(setStats)
        .catch(err => console.error('Stats error:', err));
    }
  }, [user]);

  if (!user) return <p className="p-6 text-center text-gray-500">Please log in to view your profile.</p>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 to-white dark:from-[#0c0c0c] dark:to-[#1a1a1a] text-gray-900 dark:text-blue-200">
      <Link to="/" className="text-sm text-indigo-500 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <div className="max-w-2xl mx-auto bg-white dark:bg-[#121212] shadow-lg rounded-xl p-6 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <LuUser size={48} className="text-indigo-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your Profile</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and playlists</p>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Username:</span> {user.username || user.displayName || 'Not set'}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">Your Playlists</h3>
          {!stats && <p className="text-gray-500">Loading...</p>}
          {stats && Object.keys(stats).length === 0 && (
            <p className="italic text-gray-400">You haven’t created any playlists yet.</p>
          )}
          {stats && Object.keys(stats).length > 0 && (
            <ul className="space-y-2">
              {Object.entries(stats).map(([id, { name, count }]) => (
                <li
                  key={id}
                  className="bg-indigo-50 dark:bg-[#1e1e1e] rounded-lg px-4 py-2 hover:bg-indigo-100 dark:hover:bg-[#272727] transition"
                >
                  <span className="font-medium">{name}</span> — {count} song{count !== 1 ? 's' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
