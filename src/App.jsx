// /src/App.jsx
import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import { signInUser } from './Firebase/auth';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // For demo purposes, automatically sign in the test user.
    async function signIn() {
      try {
        const user = await signInUser("test@gmail.com", "123456");
        setUser(user);
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    }
    signIn();
  }, []);

  return (
    <div className="App">
      {user ? <Dashboard user={user} /> : <p>Loading...</p>}
    </div>
  );
};

export default App;