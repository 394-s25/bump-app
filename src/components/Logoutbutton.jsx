// /src/components/LogoutButton.jsx
import { signOut } from 'firebase/auth';
import React from 'react';
import { auth } from '../Firebase/firebaseConfig';

const LogoutButton = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally, call any passed logout callback to update your context or state.
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;