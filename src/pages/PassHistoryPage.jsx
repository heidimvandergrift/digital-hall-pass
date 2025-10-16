// src/pages/PassHistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import Papa from 'papaparse'; // Import the library

function PassHistoryPage() {
  const [passes, setPasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      // Fetch all teachers to look up their names
      const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      const teachersList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teachersList);

      // Fetch all passes
      const passesQuery = query(collection(db, 'passes'), orderBy('createdAt', 'desc'));
      const passesSnapshot = await getDocs(passesQuery);
      const passesList = passesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPasses(passesList);
    };

    fetchHistory();
  }, []);
  
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.fullName : 'Unknown Teacher';
  };

  const handleExportCSV = () => {
    // 1. Format the data for the CSV
    const dataToExport = passes.map(pass => ({
      'Student Name': pass.studentName,
      'Destination': pass.destination,
      'Status': pass.status,
      'Teacher': getTeacherName(pass.teacherId),
      'Date': pass.createdAt ? new Date(pass.createdAt.toDate()).toLocaleDateString() : '',
      'Time Sent': pass.createdAt ? new Date(pass.createdAt.toDate()).toLocaleTimeString() : '',
      'Sent By': pass.sentBy || 'N/A',
      'Notes': pass.notes || ''
    }));

    // 2. Convert data to CSV format
    const csv = Papa.unparse(dataToExport);

    // 3. Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'pass_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Link to="/office">← Back to Office Dashboard</Link>
      <h1>Full Pass History</h1>
      
      <button onClick={handleExportCSV} style={{marginBottom: '20px'}}>
        Export to CSV
      </button>

      <div id="pass-list">
        {passes.map(pass => (
          <div key={pass.id}>
            <p><strong>Student:</strong> {pass.studentName}</p>
            <p><strong>To:</strong> {getTeacherName(pass.teacherId)}</p>
            <p><strong>Sent at:</strong> {pass.createdAt ? new Date(pass.createdAt.toDate()).toLocaleString() : 'Pending...'}</p>
            <p><strong>Sent by:</strong> {pass.sentBy || 'Unknown'}</p>
            <p><strong>Status:</strong> {pass.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PassHistoryPage;