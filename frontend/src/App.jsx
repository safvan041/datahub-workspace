import React from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import RepositoryPage from './RepositoryPage';
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
      <Route path='/repo/:repoId' element={
        <ProtectedRoute>
          <RepositoryPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;