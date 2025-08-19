import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CreateRepoForm.css'; // We can reuse the same modal styles
import { toast } from 'react-toastify';

function CommitModal({ fileId, script, onClose, onCommitSuccess }) {
  const [commitMessage, setCommitMessage] = useState('');
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
      const response = await fetch(`http://localhost:8080/api/files/${fileId}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.authHeader,
        },
        body: JSON.stringify({ script, commitMessage }),
      });

      if (response.ok) {
        toast.success('Changes committed successfully!');
        onCommitSuccess(); // Notify parent component
        onClose(); // Close the modal
      } else {
        setError('Failed to commit changes.');
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
        <h2>Commit Cleaned Data</h2>
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="input-group">
            <label htmlFor="commit-message">Commit Message</label>
            <input
              type="text"
              id="commit-message"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="e.g., Removed unnecessary index column"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Committing...' : 'Commit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommitModal;