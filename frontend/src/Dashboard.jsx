import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { useAuth } from './context/AuthContext';
import CreateRepoForm from './components/CreateRepoForm';
import './Dashboard.css';
import { toast } from 'react-toastify';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

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
        toast.error('Failed to fetch repositories.'); // Show error message
        setError('Failed to fetch repositories.');
      }
    } catch (err) {
      toast.error('Could not connect to the server.'); // Show error message
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
          onRepoCreated={fetchRepos}
        />
      )}

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
                // This is the updated part
                <Link to={`/repo/${repo.id}`} key={repo.id} className="repo-item-link">
                  <div className="repo-item">
                    <h3>{repo.name}</h3>
                    <p>{repo.description}</p>
                  </div>
                </Link>
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