import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // This effect runs once when the component mounts
  useEffect(() => {
    const savedSession = localStorage.getItem('userSession');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  const login = async (username, password) => {
    const credentials = btoa(`${username}:${password}`);
    const headers = { 'Authorization': `Basic ${credentials}` };

    const response = await fetch('http://localhost:8080/api/users/me', {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const userData = await response.json();
      const session = { user: userData, authHeader: `Basic ${credentials}` };
      setUser(session);
      localStorage.setItem('userSession', JSON.stringify(session));
      return true;
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
  };

  const value = { user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}