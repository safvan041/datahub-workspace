import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
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

  useEffect(() => {
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

      // --- DEBUGGING STEP 1: Log the raw response ---
      console.log('Received response from server:', response);
      const responseText = await response.text();
      console.log('Response body as text:', responseText);
      // ---------------------------------------------

      if (response.ok) {
        // --- DEBUGGING STEP 2: Safely parse the JSON ---
        let cleanedJsonData;
        try {
            cleanedJsonData = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            setError("Received invalid data from the server.");
            setLoading(false);
            return;
        }
        console.log('Parsed cleaned data:', cleanedJsonData);
        // ---------------------------------------------

        if (cleanedJsonData && cleanedJsonData.length > 0) {
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
          <button type="button" onClick={handleRunScript} disabled={loading}>
            {loading ? 'Running...' : 'Run Script'}
          </button>
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

function DataTable({ headers, data }) {
    if (!data) return null; // Add a guard clause
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