import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CommitModal from './components/CommitModal'; // Import the new component
import './FileViewer.css';

function FileViewer() {
  const { fileId } = useParams();
  const { user } = useAuth();
  const [originalData, setOriginalData] = useState([]);
  const [cleanedData, setCleanedData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [cleanedHeaders, setCleanedHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [script, setScript] = useState("df.drop(columns=['Index'], inplace=True)");
  const [showCommitModal, setShowCommitModal] = useState(false); // State for the modal

  useEffect(() => {
    // ... (keep the existing useEffect for fetching data)
    const fetchFileData = async () => {
      if (!user?.authHeader) return;
      try {
        const response = await fetch(`http://localhost:8080/api/files/${fileId}/view`, {
          headers: { 'Authorization': user.authHeader },
        });
        if (response.ok) {
          const jsonData = await response.json();
          if (jsonData.length > 0) {
            setHeaders(Object.keys(jsonData[0]));
          }
          setOriginalData(jsonData);
        } else {
          setError('Failed to fetch file content.');
        }
      } catch (err) {
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };
    fetchFileData();
  }, [fileId, user]);

  const handleRunScript = async () => {
    // ... (keep the existing handleRunScript function)
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

  return (
    <div className="file-viewer-container">
      {/* Render the modal when showCommitModal is true */}
      {showCommitModal && (
        <CommitModal
          fileId={fileId}
          script={script}
          onClose={() => setShowCommitModal(false)}
          onCommitSuccess={() => {
            // You could add logic here to show a success message
            // or refresh a commit history list in the future.
          }}
        />
      )}

      <nav className="navbar">
        <Link to="/dashboard" className="navbar-brand">← Back</Link>
      </nav>
      <main className="file-viewer-content">
        <h1>File Viewer</h1>
        {error && <p className="error-message">{error}</p>}

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
            {/* Show the commit button only after data has been cleaned */}
            {cleanedData && (
              <button type="button" onClick={() => setShowCommitModal(true)} className="btn-commit">
                Commit Changes
              </button>
            )}
          </div>
        </div>

        <div className="data-display-grid">
          {/* ... (keep the existing data display grid) ... */}
          <div className="data-panel">
            <h2>Original Data</h2>
            {loading && <p>Loading...</p>}
            {!loading && originalData.length > 0 && (
              <DataTable headers={headers} data={originalData} />
            )}
          </div>
          <div className="data-panel">
            <h2>Cleaned Data</h2>
            {cleanedData ? (
              <DataTable headers={cleanedHeaders} data={cleanedData} />
            ) : (
              <p>Run a script to see the cleaned data.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ... (keep the existing DataTable component) ...
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