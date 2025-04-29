// src/components/HeaderBar.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import { LuUser } from 'react-icons/lu';
import { FiMoon, FiSun } from 'react-icons/fi';

/** sticky header matching dashboard background (#fff7d5) */
const HeaderBar = ({ user, onLogout }) => {
  // theme toggle state (persist across sessions)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  // whenever darkMode changes, add/remove 'dark' on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode)  root.classList.add('dark');
    else           root.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <header
      className={`
        w-full flex justify-between items-center p-4 shadow
        sticky top-0
        bg-lightBeige dark:bg-darkBg
        text-gray-900    dark:text-darkText
      `}
    >
      <h1
        className="
          text-6xl font-extrabold drop-shadow-xl mb-2
          text-blue-300 dark:text-blue-400
        "
      >
        BUMP
      </h1>

      <div className="flex items-center space-x-3 mr-2">
        {user && (
          <>
            <Link
              to="/profile"
              className="
                text-2xl font-bold flex flex-col items-center text-center
                text-blue-300 dark:text-blue-400
              "
            >
              <LuUser size={24} />
              <div className="text-sm mb-1 mr-2">
                Hi,&nbsp;{user.username || user.displayName || user.email}
              </div>
            </Link>
            <LogoutButton onLogout={onLogout} />
          </>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(d => !d)}
          className="p-2 rounded focus:outline-none"
          aria-label="Toggle dark mode"
        >
          {darkMode
            ? <FiSun size={20} className="text-yellow-400" />
            : <FiMoon size={20} className="text-gray-800" />
          }
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
