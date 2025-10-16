// Triggering a new deployment
import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AdminPage() {
  // Create state variables to hold our user list and any loading/error messages.
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // This useEffect hook runs once when the component is first rendered.
  useEffect(() => {
    // Find our backend functions.
    const functions = getFunctions();
    // Specifically reference the 'listUsers' function.
    const listUsers = httpsCallable(functions, 'listUsers');

    // Call the function.
    listUsers()
      .then((result) => {
        if (result.data.users) {
          setUsers(result.data.users); // Store the user list in our state.
        } else if (result.data.error) {
          setError(result.data.error); // Store any errors.
        }
      })
      .catch((err) => {
        console.error("Error calling listUsers function:", err);
        setError('Failed to fetch user list.');
      })
      .finally(() => {
        setLoading(false); // Mark loading as complete.
      });
  }, []); // The empty array [] means this effect runs only once.

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>User Directory</h1>
      <p>This is a list of all registered users.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid black', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>UID</th>
            <th style={{ padding: '8px' }}>Email</th>
            <th style={{ padding: '8px' }}>Display Name</th>
          </tr>
        </thead>
        <tbody>
          {/* Map over the users array and create a table row for each user */}
          {users.map((user) => (
            <tr key={user.uid} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px' }}>{user.uid}</td>
              <td style={{ padding: '8px' }}>{user.email}</td>
              <td style={{ padding: '8px' }}>{user.displayName || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;