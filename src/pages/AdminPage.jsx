// src/pages/AdminPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function AdminPage() {

  const runTest = async () => {
    // PASTE THE URL YOU COPIED FROM THE FIREBASE CONSOLE HERE
    const functionUrl = "https://directconnectiontest-yjxkjbekgq-uc.a.run.app"; 

    try {
      console.log("Calling the direct endpoint...");
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Function result:", result);
      alert(`Success! Direct connection established. Server says: "${result.message}"`);
    } catch (error) {
      console.error("Error calling direct endpoint:", error);
      alert(`The test failed. Error: ${error.message}`);
    }
  };

  return (
    <div>
      <Link to="/office">← Back to Office Dashboard</Link>
      <h1>Admin Tools - Direct Connection Test</h1>
      <p>This test will determine if the website can connect to the server at all.</p>
      <button onClick={runTest}>Run Direct Connection Test</button>
    </div>
  );
}

export default AdminPage;