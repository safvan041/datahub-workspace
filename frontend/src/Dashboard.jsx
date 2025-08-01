import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CreateRepoForm from './components/CreateRepoForm'; // Import the new component
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false); // State to control the form visibility

  const fetchRepos = useCallback(async () => {
    if (!user?.authHeader) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/repos', {
        headers: { 'Authorization': user.authHeader },
      });
      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
      } else {
        setError('Failed to fetch repositories.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {showCreateForm && (
        <CreateRepoForm
          onClose={() => setShowCreateForm(false)}
          onRepoCreated={fetchRepos} // Pass the fetchRepos function to refresh the list
        />
      )}
      <nav className="navbar">
        <span className="navbar-brand">DataHub Workspace</span>
        <div className="navbar-user">
          <span>{user?.user.username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Your Repositories</h1>
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">New Repository</button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <div className="repo-list">
            {repositories.length > 0 ? (
              repositories.map(repo => (
                <div key={repo.id} className="repo-item">
                  <h3>{repo.name}</h3>
                  <p>{repo.description}</p>
                </div>
              ))
            ) : (
              <p>You haven't created any repositories yet.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;