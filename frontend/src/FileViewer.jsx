import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CommitModal from './components/CommitModal';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './FileViewer.css';
import { toast } from 'react-toastify';

// Register the components you will use from Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PAGE_SIZE = 50; // Number of rows to fetch per page

function FileViewer() {
  const { fileId } = useParams();
  const { user } = useAuth();
  
  // States for different views
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'profile', 'visualize'
  const [profileData, setProfileData] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Other existing states
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
      // Fetch paginated file content
      const viewResponse = await fetch(`http://localhost:8080/api/files/${fileId}/view/paginated?page=${currentPage}&size=${PAGE_SIZE}`, {
        headers: { 'Authorization': user.authHeader },
      });
      const viewData = await viewResponse.json();
      if (viewResponse.ok) {
        if (viewData.data.length > 0) setHeaders(Object.keys(viewData.data[0]));
        setOriginalData(viewData.data);
        setTotalPages(Math.ceil(viewData.total_rows / PAGE_SIZE));
      } else {
        toast.error('Failed to fetch file content.'); // Show error message
      }
      
      // Fetch commit history
      const commitsResponse = await fetch(`http://localhost:8080/api/files/${fileId}/commits`, {
          headers: { 'Authorization': user.authHeader },
      });
      const commitsData = await commitsResponse.json();
      if(commitsResponse.ok) {
        setCommitHistory(commitsData);
      } else {
        toast.error('Failed to fetch commit history.'); // Show error message
      }

    } catch (err) {
      toast.error('Could not connect to the server.'); // Show error message
    } finally {
      setLoading(false);
    }
  }, [fileId, user, currentPage]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const fetchProfileData = async () => {
    if (!user?.authHeader || profileData) return;
    setLoading(true);
    setError('');
    try {
        const response = await fetch(`http://localhost:8080/api/files/${fileId}/profile`, {
            headers: { 'Authorization': user.authHeader },
        });
        if(response.ok) {
            const data = await response.json();
            setProfileData(data);
        } else {
            toast.error('Failed to fetch profile data.'); // Show error message
        }
    } catch (err) {
        toast.error('Could not connect to the server.'); // Show error message
    } finally {
        setLoading(false);
    }
  };

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
        toast.error('Failed to run script.'); // Show error message
      }
    } catch (err) {
      toast.error('An error occurred while running the script.');
    } finally {
      setLoading(false);
    }
  };

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
            const selectedCommit = commitHistory.find(c => c.id === commitId);
            if (selectedCommit) {
                setScript(selectedCommit.scriptContent);
            }
        } else {
            toast.error('Failed to load data for this commit.');
        }
    } catch (err) {
        toast.error('Could not connect to the server.');
    } finally {
        setLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!selectedColumn) {
        toast.warning('Please select a column to visualize.');
        setVisualizationData(null);
        return;
    }
    setLoading(true);
    setError('');
    try {
        const response = await fetch(`http://localhost:8080/api/files/${fileId}/visualize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': user.authHeader,
            },
            body: JSON.stringify({ columnName: selectedColumn }),
        });
        if (response.ok) {
            const data = await response.json();
            setVisualizationData({
                labels: data.labels,
                datasets: [{
                    label: `Value Counts for ${selectedColumn}`,
                    data: data.values,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                }]
            });
        } else {
            toast.error('Failed to generate visualization.');
        }
    } catch (err) {
        toast.error('Could not connect to the server.');
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
                <div className="tabs">
                    <button className={`tab-button ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>Data View</button>
                    <button className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); fetchProfileData(); }}>Profile View</button>
                    <button className={`tab-button ${activeTab === 'visualize' ? 'active' : ''}`} onClick={() => setActiveTab('visualize')}>Visualize</button>
                </div>

                {activeTab === 'data' && (
                    <>
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
                                  <>
                                    <DataTable headers={headers} data={originalData} />
                                    <div className="pagination-controls">
                                      <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                                        Previous
                                      </button>
                                      <span>Page {currentPage + 1} of {totalPages}</span>
                                      <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage + 1 >= totalPages}>
                                        Next
                                      </button>
                                    </div>
                                  </>
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
                    </>
                )}

                {activeTab === 'profile' && (
                    <div className="profile-panel">
                        <h2>Dataset Profile</h2>
                        {loading && <p>Generating profile...</p>}
                        {profileData && (
                            <div>
                                <h3>General Info</h3>
                                <p>Rows: {profileData.general_info.rows} | Columns: {profileData.general_info.columns}</p>
                                <h3>Column Details</h3>
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Column</th>
                                                <th>Dtype</th>
                                                <th>Null_Count</th>
                                                <th>count</th>
                                                <th>mean</th>
                                                <th>std</th>
                                                <th>min</th>
                                                <th>max</th>
                                                <th>unique</th>
                                                <th>top</th>
                                                <th>freq</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profileData.column_profiles.map(col => (
                                                <tr key={col.Column}>
                                                    <td>{col.Column}</td>
                                                    <td>{col.Dtype}</td>
                                                    <td>{col.Null_Count}</td>
                                                    <td>{col.count}</td>
                                                    <td>{col.mean}</td>
                                                    <td>{col.std}</td>
                                                    <td>{col.min}</td>
                                                    <td>{col.max}</td>
                                                    <td>{col.unique}</td>
                                                    <td>{col.top}</td>
                                                    <td>{col.freq}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'visualize' && (
                    <div className="visualize-panel">
                        <h2>Visualize Column Data</h2>
                        <div className="visualize-controls">
                            <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)}>
                                <option value="">-- Select a Column --</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <button onClick={handleVisualize} disabled={!selectedColumn || loading}>
                                {loading ? 'Generating...' : 'Generate Chart'}
                            </button>
                        </div>
                        <div className="chart-container">
                            {visualizationData ? <Bar data={visualizationData} /> : <p>Select a column and click "Generate Chart" to see a visualization.</p>}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="history-panel">
                <h2>Commit History</h2>
                {commitHistory.length > 0 ? (
                    <div className="commit-list">
                        {commitHistory.map(commit => (
                            <div key={commit.id} className="commit-item">
                                <p className="commit-message">{commit.commitMessage}</p>
                                <pre className="commit-script">{commit.scriptContent}</pre>
                                <p className="commit-date">
                                    Committed on: {new Date(commit.createdAt).toLocaleString()}
                                </p>
                                <button onClick={() => handleViewCommit(commit.id)} className="view-commit-btn">
                                    View & Load Script
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
    if (!data || data.length === 0) return <p>No data to display.</p>;
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