import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Create the Basic Auth header
    const credentials = btoa(`${username}:${password}`);
    const headers = {
      'Authorization': `Basic ${credentials}`
    };

    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        method: 'GET',
        headers: headers,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        alert('Login successful!');
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('Could not connect to the server. Is it running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>DataHub Login</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ marginTop: '1rem' }}>
          <a href="/register">Don't have an account? Register</a>
        </p>
      </form>
    </div>
  );
}

export default Login;