// src/components/RoleBasedRedirect.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function RoleBasedRedirect() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.isApproved) {
            if (userData.role === 'teacher') {
              navigate('/teacher');
            } else if (userData.role === 'office') {
              navigate('/office');
            } else {
              // Handle other roles or lack of role
              navigate('/login');
            }
          } else {
            // Handle not approved users
            alert('Your account is pending approval.');
            navigate('/login');
          }
        }
      } else {
        // No user is signed in
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return null;
}

export default RoleBasedRedirect;