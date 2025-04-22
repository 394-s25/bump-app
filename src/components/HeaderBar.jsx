// src/components/HeaderBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './Logoutbutton';

/** sticky header matching dashboard background (#fff7d5) */
const HeaderBar = ({ user, onLogout }) => (
  <header
    className="w-full flex justify-between items-center p-4 shadow"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#fff7d5',
    }}
  >
      <h1
          className="text-6xl font-extrabold drop-shadow-xl mb-2"
          style={{ color: '#a7b8ff', textShadow: '2px 2px 0 rgba(0,0,0,.25)' }}
        >
          BUMP
      </h1>
    {user ? (
      <div className="flex items-center space-x-3">
        <Link
          to="/profile"
          className="underline decoration-indigo-500 text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Hi&nbsp;{user.username || user.displayName || user.email}
        </Link>
        <LogoutButton onLogout={onLogout} />
      </div>
    ) : null}
  </header>
);

export default HeaderBar;