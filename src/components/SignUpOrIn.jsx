// src/components/SignUpOrIn.jsx
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
    setIsSignUp((prevState) => !prevState);
    setError(null);
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', marginRight: '10px' }}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginTop: '15px' }}>
        <p>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleMode} style={{ marginLeft: '5px' }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpOrIn;