// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import schoolLogo from '../assets/Falcon.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'office') {
          navigate('/office');
        } else if (userData.role === 'teacher') {
          navigate('/teacher');
        } else {
          alert('User role not found.');
        }
      } else {
        alert('User data not found.');
      }
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <img src={schoolLogo} alt="Ross Middle School Logo" style={{ width: '100px', marginBottom: '20px' }} />
      <h1 style={{ border: 'none' }}>Ross Middle School</h1>
      <h2 style={{ border: 'none', marginTop: '-15px', color: '#666' }}>Student Hall Passes</h2>
      
      <form onSubmit={handleLogin}>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;