// src/pages/TeacherDashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function TeacherDashboard() {
  const [userData, setUserData] = useState(null);
  const [allPasses, setAllPasses] = useState([]);
  const [audioReady, setAudioReady] = useState(false);
  const [showOldPasses, setShowOldPasses] = useState(false);
  const [passToAcknowledge, setPassToAcknowledge] = useState(null);
  const [replyingToPassId, setReplyingToPassId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const isInitialMount = useRef(true);

  if (!audioRef.current) {
    audioRef.current = new Audio('/notification.mp3');
  }

  // Effect 1: Get the current user's profile from Firestore.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setUserData({ uid: currentUser.uid, ...docSnap.data() });
        }
      });
    }
  }, []);

  // Effect 2: Set up the pass listener once the user profile is loaded.
  useEffect(() => {
    if (!userData) {
      return; // Do nothing if we don't have the user's info yet.
    }

    const passesQuery = query(collection(db, 'passes'), where('teacherId', '==', userData.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(passesQuery, (querySnapshot) => {
      
      // THIS IS THE CORRECTED LOGIC
      if (!isInitialMount.current) {
        // Check the specific changes to the document list
        querySnapshot.docChanges().forEach((change) => {
          // If a document was ADDED, it's a new pass.
          if (change.type === 'added') {
            if (audioReady && userData.soundEnabled) {
              audioRef.current.play().catch(e => console.error("Audio failed:", e));
            }
          }
          // We ignore changes of type 'modified' or 'removed' for sound purposes
        });
      }
      
      // Update the state with the full list of current passes
      const currentPasses = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllPasses(currentPasses);
      
      isInitialMount.current = false;
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [userData, audioReady]); // This effect depends on userData and audioReady

  const handleEnableSound = () => {
    audioRef.current.muted = true;
    audioRef.current.play().then(() => {
      setAudioReady(true);
      audioRef.current.muted = false;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }).catch(error => {
      console.error("Audio enable failed:", error);
      alert("Could not enable audio. Please check browser permissions.");
    });
  };

  const handleAcknowledge = (passId) => setPassToAcknowledge(passId);
  const handleConfirmHide = async (passId) => { await updateDoc(doc(db, 'passes', passId), { status: 'Acknowledged' }); setPassToAcknowledge(null); };
  const handleKeepOnDashboard = async (passId) => { await updateDoc(doc(db, 'passes', passId), { status: 'Confirmed' }); setPassToAcknowledge(null); };
  const handleLogout = async () => { await signOut(auth); navigate('/login'); };
  const handleSendReply = async (passId) => { if (!replyText) return alert("Please enter a reply."); await updateDoc(doc(db, 'passes', passId), { teacherResponse: replyText }); setReplyingToPassId(null); setReplyText(""); alert("Reply sent."); };
  const displayedPasses = showOldPasses ? allPasses : allPasses.filter(p => p.status === 'Sent' || p.status === 'Confirmed');

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      
      {userData && userData.soundEnabled && !audioReady && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd' }}>
          <p style={{ margin: 0 }}>Sound notifications are available.</p>
          <button onClick={handleEnableSound} style={{ marginTop: '10px' }}>Click to Enable Sound</button>
        </div>
      )}

      <h2>Incoming Passes</h2>
      <button onClick={() => setShowOldPasses(!showOldPasses)} style={{marginBottom: '20px', backgroundColor: '#7f8c8d'}}>
        {showOldPasses ? 'Hide Old Passes' : 'Show Old Passes'}
      </button>
      
      <div id="pass-list">
        {/* The rest of the page is unchanged */}
        {displayedPasses.map(pass => (
          <div key={pass.id} className={pass.isReminder ? 'reminder-pass' : ''}>
            <p><strong>Student:</strong> {pass.studentName}</p>
            <p><strong>Destination:</strong> {pass.destination}</p>
            <p><strong>Notes:</strong> {pass.notes}</p>
            <p><strong>Status:</strong> {pass.status}</p>
            
            {pass.status !== 'Acknowledged' && passToAcknowledge !== pass.id && (
              <div>
                {pass.status === 'Sent' && <button onClick={() => handleAcknowledge(pass.id)}>Acknowledge</button>}
                {pass.status === 'Confirmed' && <button onClick={() => handleConfirmHide(pass.id)} style={{backgroundColor: '#95a5a6'}}>Hide Pass</button>}
                <button onClick={() => { setReplyingToPassId(pass.id); setPassToAcknowledge(null); }} style={{marginLeft: '10px', backgroundColor: '#f1c40f', color: '#333'}}>Reply</button>
              </div>
            )}

            {replyingToPassId === pass.id && (
              <div style={{marginTop: '10px'}}>
                <textarea 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder="e.g., Student not in class."
                />
                <button onClick={() => handleSendReply(pass.id)} style={{marginTop: '5px'}}>Send Reply</button>
                <button onClick={() => setReplyingToPassId(null)} style={{marginLeft: '5px', backgroundColor: '#bdc3c7'}}>Cancel</button>
              </div>
            )}

            {passToAcknowledge === pass.id && (
              <div style={{marginTop: '10px', padding: '10px', border: '1px solid #ccc'}}>
                <p>Hide this pass from your main dashboard?</p>
                <button onClick={() => handleConfirmHide(pass.id)} style={{marginRight: '10px'}}>Yes, Hide Pass</button>
                <button onClick={() => handleKeepOnDashboard(pass.id)} style={{backgroundColor: '#2ecc71'}}>No, Keep on Dashboard</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherDashboard;