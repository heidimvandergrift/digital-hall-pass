// src/pages/OfficeDashboard.jsx

import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function OfficeDashboard() {
  const [officeUser, setOfficeUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [todaysPasses, setTodaysPasses] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const navigate = useNavigate();

  // Effect 1: Get the current user's profile from Firestore.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setOfficeUser({ uid: currentUser.uid, ...docSnap.data() });
        }
      });
    }
  }, []);

  // Effect 2: Set up listeners ONLY after the user profile is loaded.
  useEffect(() => {
    // Guard clause: Do nothing if we don't have the user's info yet.
    if (!officeUser) {
      return;
    }

    // Fetch teachers list
    const fetchTeachers = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const querySnapshot = await getDocs(q);
      const teachersList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeachers(teachersList);
    };
    fetchTeachers();

    // Set up the real-time passes listener
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const passesQuery = query(collection(db, 'passes'), where('createdAt', '>=', startOfToday), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(passesQuery, (querySnapshot) => {
      const passesData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTodaysPasses(passesData);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [officeUser]); // This effect depends on officeUser

  const handleSendPass = async (e) => {
    e.preventDefault();
    if (!officeUser) return alert('Cannot send pass, user data not loaded.');
    try {
      await addDoc(collection(db, 'passes'), {
        studentName, destination, notes,
        teacherId: selectedTeacher,
        sentBy: officeUser.fullName,
        status: 'Sent',
        createdAt: serverTimestamp(),
        isReminder: false
      });
      setStudentName(''); setDestination(''); setNotes(''); setSelectedTeacher('');
      alert('Pass sent successfully!');
    } catch (error) {
      alert(`Error sending pass: ${error.message}`);
    }
  };

  const handleSendReminder = async (passToRemind) => {
    try {
      await deleteDoc(doc(db, 'passes', passToRemind.id));
      await addDoc(collection(db, 'passes'), {
        studentName: passToRemind.studentName,
        destination: passToRemind.destination,
        notes: `(Reminder) ${passToRemind.notes}`,
        teacherId: passToRemind.teacherId,
        sentBy: passToRemin.sentBy,
        status: 'Sent',
        createdAt: serverTimestamp(),
        isReminder: true
      });
      alert('Reminder sent!');
    } catch (error) {
      alert(`Error sending reminder: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.fullName : 'Unknown Teacher';
  };

  return (
    <div>
      <h1>Office Dashboard</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <Link to="/office/history">View Pass History</Link>
          <Link to="/office/admin" style={{ marginLeft: '20px' }}>Admin Tools</Link>
        </div>
        <button onClick={handleLogout} style={{ margin: 0 }}>Logout</button>
      </div>
      <form onSubmit={handleSendPass}>
        <h3>Create New Pass</h3>
        <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student Name" required />
        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination (e.g., Office)" required />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"></textarea>
        <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} required>
          <option value="">Select a Teacher</option>
          {teachers.map(teacher => (<option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>))}
        </select>
        <button type="submit">Send Pass</button>
      </form>
      <h2>Live Pass Feed (Today)</h2>
      <div id="pass-list">
        {todaysPasses.map(pass => (
          <div key={pass.id}>
            <p><strong>Student:</strong> {pass.studentName}</p>
            <p><strong>To:</strong> {getTeacherName(pass.teacherId)}</p>
            <p><strong>Sent at:</strong> {pass.createdAt ? new Date(pass.createdAt.toDate()).toLocaleTimeString() : 'Pending...'}</p>
            <p><strong>Sent by:</strong> {pass.sentBy || 'Unknown'}</p>
            <p><strong>Status:</strong> <span style={{ color: pass.status === 'Acknowledged' ? 'green' : pass.status === 'Confirmed' ? 'blue' : 'orange', fontWeight: 'bold' }}>{pass.status}</span></p>
            {pass.teacherResponse && (<p style={{ backgroundColor: '#f8d7da', padding: '5px', borderRadius: '4px' }}><strong>Teacher Reply:</strong> {pass.teacherResponse}</p>)}
            {pass.status === 'Sent' && (<button onClick={() => handleSendReminder(pass)} style={{ backgroundColor: '#e67e22', marginTop: '10px' }}>Send Reminder</button>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfficeDashboard;