import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CreateRepoForm.css';

function CreateRepoForm({ onClose, onRepoCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.authHeader) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.authHeader,
        },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        onRepoCreated(); // Tell the dashboard to refresh
        onClose(); // Close the form
      } else {
        setError('Failed to create repository.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Repository</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="input-group">
            <label htmlFor="repo-name">Repository Name</label>
            <input
              type="text"
              id="repo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="repo-description">Description</label>
            <textarea
              id="repo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRepoForm;