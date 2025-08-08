import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CommitModal from './components/CommitModal';
import './FileViewer.css';

function FileViewer() {
  const { fileId } = useParams();
  const { user } = useAuth();
  const [originalData, setOriginalData] = useState([]);
  const [cleanedData, setCleanedData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [cleanedHeaders, setCleanedHeaders] = useState([]);
  const [commitHistory, setCommitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [script, setScript] = useState("df.drop(columns=['Index'], inplace=True)");
  const [showCommitModal, setShowCommitModal] = useState(false);

  const fetchPageData = useCallback(async () => {
    if (!user?.authHeader) return;
    setLoading(true);
    setError('');
    try {
      const viewResponse = await fetch(`http://localhost:8080/api/files/${fileId}/view`, {
        headers: { 'Authorization': user.authHeader },
      });
      const viewData = await viewResponse.json();
      if (viewResponse.ok) {
        if (viewData.length > 0) setHeaders(Object.keys(viewData[0]));
        setOriginalData(viewData);
      } else {
        throw new Error('Failed to fetch file content');
      }
      
      const commitsResponse = await fetch(`http://localhost:8080/api/files/${fileId}/commits`, {
          headers: { 'Authorization': user.authHeader },
      });
      const commitsData = await commitsResponse.json();
      if(commitsResponse.ok) {
        setCommitHistory(commitsData);
      } else {
        throw new Error('Failed to fetch commit history');
      }

    } catch (err) {
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [fileId, user]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleRunScript = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8080/api/files/${fileId}/clean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.authHeader,
        },
        body: JSON.stringify({ script }),
      });
      if (response.ok) {
        const cleanedJsonData = await response.json();
        if (cleanedJsonData.length > 0) {
          setCleanedHeaders(Object.keys(cleanedJsonData[0]));
        }
        setCleanedData(cleanedJsonData);
      } else {
        setError('Failed to execute cleaning script.');
      }
    } catch (err) {
      setError('An error occurred while running the script.');
    } finally {
      setLoading(false);
    }
  };

  // --- THIS IS THE NEW FUNCTION ---
  const handleViewCommit = async (commitId) => {
    setLoading(true);
    setError('');
    try {
        const response = await fetch(`http://localhost:8080/api/commits/${commitId}/view`, {
            headers: { 'Authorization': user.authHeader },
        });
        if (response.ok) {
            const commitData = await response.json();
            if (commitData.length > 0) {
                setCleanedHeaders(Object.keys(commitData[0]));
            }
            setCleanedData(commitData);
        } else {
            setError('Failed to load data for this commit.');
        }
    } catch (err) {
        setError('Could not connect to the server.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="file-viewer-container">
      {showCommitModal && (
        <CommitModal
          fileId={fileId}
          script={script}
          onClose={() => setShowCommitModal(false)}
          onCommitSuccess={fetchPageData}
        />
      )}

      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">← Back</Link>
      </nav>
      <main className="file-viewer-content">
        <h1>File Viewer</h1>
        {error && <p className="error-message">{error}</p>}
        
        <div className="main-grid">
            <div className="cleaning-and-data-panel">
                <div className="cleaning-section">
                <h2>Cleaning Script (Python/Pandas)</h2>
                <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows="5"
                    placeholder="Enter your pandas script here. Use 'df' as the DataFrame variable."
                />
                <div className="cleaning-actions">
                    <button type="button" onClick={handleRunScript} disabled={loading}>
                    {loading ? 'Running...' : 'Run Script'}
                    </button>
                    {cleanedData && (
                    <button type="button" onClick={() => setShowCommitModal(true)} className="btn-commit">
                        Commit Changes
                    </button>
                    )}
                </div>
                </div>

                <div className="data-display-grid">
                <div className="data-panel">
                    <h2>Original Data</h2>
                    {loading && <p>Loading...</p>}
                    {!loading && originalData.length > 0 && (
                    <DataTable headers={headers} data={originalData} />
                    )}
                </div>
                <div className="data-panel">
                    <h2>Cleaned Data / Version Preview</h2>
                    {cleanedData ? (
                    <DataTable headers={cleanedHeaders} data={cleanedData} />
                    ) : (
                    <p>Run a script or select a commit to see the data.</p>
                    )}
                </div>
                </div>
            </div>
            
            <div className="history-panel">
                <h2>Commit History</h2>
                {commitHistory.length > 0 ? (
                    <div className="commit-list">
                        {commitHistory.map(commit => (
                            // This is the updated part
                            <div key={commit.id} className="commit-item">
                                <p className="commit-message">{commit.commitMessage}</p>
                                <pre className="commit-script">{commit.scriptContent}</pre>
                                <p className="commit-date">
                                    Committed on: {new Date(commit.createdAt).toLocaleString()}
                                </p>
                                <button onClick={() => handleViewCommit(commit.id)} className="view-commit-btn">
                                    View this version
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No commits have been made for this file yet.</p>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

function DataTable({ headers, data }) {
    if (!data) return null;
    return (
        <div className="table-container">
        <table>
            <thead>
            <tr>
                {headers.map(header => <th key={header}>{header}</th>)}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr key={index}>
                {headers.map(header => <td key={header}>{row[header]}</td>)}
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}

export default FileViewer;
