// LoginButton.jsx – simple link to the auth page
import React from 'react';
import { Link } from 'react-router-dom';

const LoginButton = () => (
  <Link
    to="/login"
    className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
  >
    Log&nbsp;In
  </Link>
);

export default LoginButton;