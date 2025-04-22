// src/components/HeaderBar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

/** sticky header matching dashboard background (#fff7d5) */
const HeaderBar = ({ user, onLogout }) => (
  <header
    className="w-full flex justify-end items-center p-4 shadow"
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#fff7d5',
    }}
  >
    {!user && <LoginButton />}
    {user && (
      <div className="flex items-center space-x-3">
        <Link
          to="/profile"
          className="underline decoration-indigo-500 text-indigo-600 hover:text-indigo-800 text-sm"
        >
          Hi&nbsp;{user.username || user.displayName || user.email}
        </Link>
        <LogoutButton onLogout={onLogout} />
      </div>
    )}
  </header>
);

export default HeaderBar;