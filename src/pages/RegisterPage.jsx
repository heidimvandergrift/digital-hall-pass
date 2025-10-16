// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import schoolLogo from '../assets/Falcon.png';

function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [soundPreference, setSoundPreference] = useState(true);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        role: 'teacher',
        isApproved: false,
        soundEnabled: soundPreference
      });

      alert('Registration successful! Please wait for an administrator to approve your account.');
      navigate('/login');
    } catch (error) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <img src={schoolLogo} alt="Ross Middle School Logo" style={{ width: '100px', marginBottom: '20px' }} />
      <h1 style={{ border: 'none' }}>Ross Middle School</h1>
      <h2 style={{ border: 'none', marginTop: '-15px', color: '#666' }}>Student Hall Passes</h2>
      
      <form onSubmit={handleRegister}>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
          required
        />
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
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <input
            id="sound-check"
            name="sound-check"
            type="checkbox"
            checked={soundPreference}
            onChange={(e) => setSoundPreference(e.target.checked)}
          />
          <label htmlFor="sound-check">Enable sound notifications</label>
        </div>

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;