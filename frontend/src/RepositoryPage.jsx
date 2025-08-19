import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './RepositoryPage.css';
import { toast } from 'react-toastify';

function RepositoryPage() {
  const { repoId } = useParams();
  const { user } = useAuth();
  const [repo, setRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchRepoData = useCallback(async () => {
    if (!user?.authHeader) return;
    setLoading(true);
    try {
      const repoResponse = await fetch(`http://localhost:8080/api/repos/${repoId}`, {
        headers: { 'Authorization': user.authHeader },
      });
      const repoData = await repoResponse.json();
      setRepo(repoData);

      const filesResponse = await fetch(`http://localhost:8080/api/repos/${repoId}/files`, {
        headers: { 'Authorization': user.authHeader },
      });
      const filesData = await filesResponse.json();
      setFiles(filesData);

    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  }, [repoId, user]);

  useEffect(() => {
    fetchRepoData();
  }, [fetchRepoData]);

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.'); // Show error message
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`http://localhost:8080/api/repos/${repoId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': user.authHeader },
        body: formData,
      });

      if (response.ok) {
        toast.success('File uploaded successfully!'); // Show success message
        fetchRepoData();
        setSelectedFile(null);
      } else {
        toast.error('File upload failed.'); // Show error message
      }
    } catch (err) {
      toast.error('Could not connect to the server.'); // Show error message
    }
  };

  return (
    <div className="repo-page-container">

      <main className="repo-page-content">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {repo && (
          <div>
            <h1>{repo.name}</h1>
            <p className="repo-description">{repo.description}</p>
            <hr />
            <div className="upload-section">
              <h2>Upload New Dataset</h2>
              <input type="file" onChange={handleFileSelect} />
              <button onClick={handleUpload} disabled={!selectedFile}>Upload</button>
            </div>
            <hr />
            <h2>Uploaded Files</h2>
            <div className="file-list">
              {files.length > 0 ? (
                files.map(file => (
                  // This is the updated part
                  <Link to={`/file/${file.id}/view`} key={file.id} className="file-item-link">
                    <div className="file-item">
                      {file.fileName}
                    </div>
                  </Link>
                ))
              ) : (
                <p>No files uploaded to this repository yet.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RepositoryPage;