// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import TeacherDashboard from './pages/TeacherDashboard';
import OfficeDashboard from './pages/OfficeDashboard';
import PassHistoryPage from './pages/PassHistoryPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import our new component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/office" element={
          <ProtectedRoute role="office">
            <OfficeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/office/history" element={
          <ProtectedRoute role="office">
            <PassHistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/office/admin" element={
          <ProtectedRoute role="office">
            <AdminPage />
          </ProtectedRoute>
        } />
        
        {/* Root path redirect */}
        <Route path="/" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;