import React from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/login" />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/dashboard' element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;