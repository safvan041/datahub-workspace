import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component checks if a user is logged in.
// If not, it redirects them to the login page.
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Try to get user session from localStorage if it's not in the state yet
  const savedSession = JSON.parse(localStorage.getItem('userSession'));

  if (!user && !savedSession) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;