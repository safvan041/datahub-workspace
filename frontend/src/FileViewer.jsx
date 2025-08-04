import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './FileViewer.css';

function FileViewer() {
  const { fileId } = useParams(); // Gets the file ID from the URL
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setData(jsonData);
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

  return (
    <div className="file-viewer-container">
      <nav className="navbar">
        {/* This is a simple way to go back, a better way would use the repoId */}
        <Link to="/dashboard" className="navbar-brand">← Back</Link>
      </nav>
      <main className="file-viewer-content">
        <h1>File Content</h1>
        {loading && <p>Loading data...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && data.length > 0 && (
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
        )}
      </main>
    </div>
  );
}

export default FileViewer;