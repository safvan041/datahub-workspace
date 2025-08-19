import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RepositoryPage from './RepositoryPage';
import FileViewer from './FileViewer';
import Layout from './components/Layout'; // Import the new Layout

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All protected routes will now be wrapped by the Layout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/repo/:repoId" element={<RepositoryPage />} />
                  <Route path="/file/:fileId/view" element={<FileViewer />} />
                  {/* Redirect any other protected route to the dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
    </>
  );
}

export default App;