// src/components/ProtectedRoute.jsx

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // No user found, redirect to login
        navigate('/login');
        return;
      }

      // User is found, check their role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === role) {
        // User has the correct role, stop loading
        setIsLoading(false);
      } else {
        // User does not have the correct role, redirect to login
        // You could also redirect to an "unauthorized" page
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, role]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return children; // If not loading, render the actual page component
}

export default ProtectedRoute;