import React from 'react';
import './App.css';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

function App() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Successfully signed up!');
    } catch (error) {
      alert('Error signing up: ' + error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Successfully signed in!');
    } catch (error) {
      alert('Error signing in: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      alert('Successfully signed out!');
    } catch (error) {
      alert('Error signing out: ' + error.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Firebase App</h1>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignUp}>Sign Up</button>
          <button onClick={handleSignIn}>Sign In</button>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>
    </div>
  );
}

export default App;