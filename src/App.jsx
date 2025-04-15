// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import SignUpOrIn from './components/SignUpOrIn';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} />
      ) : (
        <SignUpOrIn onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      )}
    </div>
  );
};

export default App;
