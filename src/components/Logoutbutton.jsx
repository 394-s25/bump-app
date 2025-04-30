import { signOut } from 'firebase/auth';
import React from 'react';
import { auth } from '../Firebase/firebaseConfig';

const LogoutButton = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1 bg-red-500 text-white dark:text-gray-800 rounded hover:bg-red-600 text-sm ml-2"
      style={{ backgroundColor: '#a7b8ff' }}
    >
      Log&nbsp;Out
    </button>
  );
};

export default LogoutButton;