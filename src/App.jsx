// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SignUpOrIn from './components/SignUpOrIn';
import Home from './components/Home';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/home" />
            ) : (
              <SignUpOrIn onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
            )
          }
        />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        {/* Optionally: catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
