import React from 'react';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import RepositoryPage from './RepositoryPage';
import FileViewer from './FileViewer';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
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
        <Route path='/file/:fileId/view' element={
          <ProtectedRoute>
            <FileViewer />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;