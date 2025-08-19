import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CreateRepoForm from './components/CreateRepoForm';
import './Dashboard.css';
import { toast } from 'react-toastify';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // This function is now updated to call the new dashboard endpoint
  const fetchRepos = useCallback(async () => {
    if (!user?.authHeader) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/repos/dashboard', {
        headers: { 'Authorization': user.authHeader },
      });
      if (response.ok) {
        const data = await response.json();
        setRepositories(data);
      } else {
        toast.error('Failed to fetch repositories. Please try again later.');
      }
    } catch (err) {
      toast.error('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <div className="dashboard-content">
      {showCreateForm && (
        <CreateRepoForm
          onClose={() => setShowCreateForm(false)}
          onRepoCreated={fetchRepos}
        />
      )}
      
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
              <Link to={`/repo/${repo.id}`} key={repo.id} className="repo-item-link">
                <div className="repo-item">
                  <h3>{repo.name}</h3>
                  <p>{repo.description}</p>
                  {/* This is the new stats section */}
                  <div className="repo-stats">
                    <span>Files: {repo.fileCount}</span>
                    <span>
                      Last updated: {repo.lastCommitDate ? new Date(repo.lastCommitDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>You haven't created any repositories yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;