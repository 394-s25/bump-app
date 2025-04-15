// references: https://www.youtube.com/watch?v=8QgQKRcAUvM&ab_channel=GreatStack
// references: https://www.youtube.com/watch?v=qgRoBaqhdZc&ab_channel=KrisFoster

import React, { useState } from 'react';
import { signUpUser, signInUser } from '../Firebase/auth';

const SignUpOrIn = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      let authenticatedUser;
      if (isSignUp) {
        authenticatedUser = await signUpUser(email, password);
      } else {
        authenticatedUser = await signInUser(email, password);
      }
      if (onAuthSuccess) {
        onAuthSuccess(authenticatedUser);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#fff7d5' }}
    >
      <h1
        className="text-6xl font-extrabold mb-4 drop-shadow-xl" 
        style={{ color: '#a7b8ff', textShadow: '2px 2px 0px rgba(0, 0, 0, 0.25)',}}
      >
        BUMP
      </h1>
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl border border-indigo-100">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border border-gray-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded border border-gray-300"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded font-semibold"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={toggleMode}
            className="ml-2 text-indigo-600 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpOrIn;