import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './RepositoryPage.css';

function RepositoryPage() {
  const { repoId } = useParams(); // Gets the ID from the URL
  const { user } = useAuth();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepo = async () => {
      if (!user?.authHeader) return;

      try {
        const response = await fetch(`http://localhost:8080/api/repos/${repoId}`, {
          headers: { 'Authorization': user.authHeader },
        });

        if (response.ok) {
          const data = await response.json();
          setRepo(data);
        } else {
          setError('Failed to fetch repository details.');
        }
      } catch (err) {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepo();
  }, [repoId, user]);

  return (
    <div className="repo-page-container">
      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">← Back to Dashboard</Link>
      </nav>
      <main className="repo-page-content">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {repo && (
          <div>
            <h1>{repo.name}</h1>
            <p className="repo-description">{repo.description}</p>
            <p className="repo-owner">Owned by: {repo.owner.username}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default RepositoryPage;