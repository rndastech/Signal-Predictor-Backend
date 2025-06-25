import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signalAPI } from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [splitPoint, setSplitPoint] = useState('');
  const [noiseFilter, setNoiseFilter] = useState(0);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('csv_file', file);
      formData.append('advanced_mode', advancedMode);
      formData.append('noise_filter', noiseFilter);
      
      if (advancedMode && splitPoint) {
        formData.append('split_point', splitPoint);
      }

      const response = await signalAPI.uploadCSV(formData);
      
      if (response.data.success) {
        // Navigate to analysis detail page for the newly created analysis
        navigate(`/analysis/${response.data.analysis.id}`);
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };  return (
    <div
      className="min-vh-100"
      style={{
        paddingTop: "80px",
        background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-7">
            <div
              className="card"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "25px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="card-header text-center" style={{ background: "transparent", border: "none", padding: "2rem 2rem 1rem" }}>
                <div
                  className="mb-3"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    border: "2px solid rgba(255, 193, 7, 0.2)",
                  }}
                >
                  <i
                    className="fas fa-upload"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  UPLOAD SIGNAL DATA
                </h2>
                <p className="text-muted fs-6">
                  Upload your CSV files with signal data for AI-powered analysis and predictive modeling
                </p>
              </div>

              <div className="card-body" style={{ padding: "1rem 2rem 2rem" }}>
                <form onSubmit={handleSubmit}>                  {/* File Upload Area */}
                  <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'file-selected' : ''}`}
                    style={{
                      border: `2px dashed ${file ? '#22c55e' : dragActive ? '#ffc107' : 'rgba(255, 193, 7, 0.5)'}`,
                      borderRadius: "15px",
                      padding: "3rem 2rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: file ? "rgba(34, 197, 94, 0.05)" : dragActive ? "rgba(255, 193, 7, 0.1)" : "rgba(255, 193, 7, 0.03)",
                      marginBottom: "1.5rem",
                      textAlign: "center",
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    {file ? (
                      <>
                        <i
                          className="fas fa-check-circle mb-3"
                          style={{
                            fontSize: "3rem",
                            color: "#22c55e",
                          }}
                        ></i>
                        <h4 className="text-light mb-2" style={{ fontWeight: "600" }}>
                          File Selected
                        </h4>
                        <p className="text-light mb-2" style={{ fontSize: "1.1rem" }}>
                          {file.name}
                        </p>
                        <p className="text-muted mb-3">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          className="btn btn-outline-success"
                          style={{
                            borderRadius: "20px",
                            padding: "8px 20px",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setError('');
                          }}
                        >
                          <i className="fas fa-sync-alt me-2"></i>
                          CHANGE FILE
                        </button>
                      </>
                    ) : (
                      <>
                        <i
                          className="fas fa-cloud-upload-alt mb-3"
                          style={{
                            fontSize: "3rem",
                            color: "#ffc107",
                          }}
                        ></i>
                        <h4 className="text-warning mb-2" style={{ fontWeight: "600" }}>
                          Drag & Drop CSV Files
                        </h4>
                        <p className="text-muted mb-3">or click to browse your files</p>
                        <button
                          type="button"
                          className="btn btn-warning"
                          style={{
                            borderRadius: "20px",
                            padding: "10px 25px",
                            fontWeight: "600",
                          }}
                        >
                          <i className="fas fa-file-csv me-2"></i>
                          SELECT FILES
                        </button>
                      </>
                    )}
                    
                    <input
                      id="fileInput"
                      type="file"
                      accept=".csv"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Advanced Options */}
                  <div className="mb-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="advancedMode"
                        checked={advancedMode}
                        onChange={(e) => setAdvancedMode(e.target.checked)}
                        style={{
                          backgroundColor: advancedMode ? '#ffc107' : 'transparent',
                          borderColor: '#ffc107',
                        }}
                      />
                      <label className="form-check-label text-light" htmlFor="advancedMode" style={{ fontWeight: "500" }}>
                        Advanced Options
                      </label>
                    </div>

                    {advancedMode && (
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "15px",
                          padding: "1.5rem",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="splitPoint" className="form-label text-warning" style={{ fontWeight: "500" }}>
                              <i className="fas fa-cut me-2"></i>
                              Split Point (optional)
                            </label>
                            <input
                              id="splitPoint"
                              type="number"
                              className="form-control"
                              value={splitPoint}
                              onChange={(e) => setSplitPoint(e.target.value)}
                              placeholder="Auto-detection enabled"
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "10px",
                                color: "#fff",
                              }}
                            />
                            <small className="form-text text-muted">Leave empty for automatic detection</small>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="noiseFilter" className="form-label text-warning" style={{ fontWeight: "500" }}>
                              <i className="fas fa-filter me-2"></i>
                              Noise Filter Level
                            </label>
                            <input
                              id="noiseFilter"
                              type="number"
                              className="form-control"
                              value={noiseFilter}
                              onChange={(e) => setNoiseFilter(parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.1"
                              placeholder="0.0"
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                borderRadius: "10px",
                                color: "#fff",
                              }}
                            />
                            <small className="form-text text-muted">Higher values = more filtering</small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      className="alert alert-danger"
                      style={{
                        background: "rgba(220, 53, 69, 0.1)",
                        border: "1px solid rgba(220, 53, 69, 0.3)",
                        borderRadius: "10px",
                        color: "#dc3545",
                      }}
                    >
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="text-center mb-4">
                    <button
                      type="submit"
                      className="btn btn-warning btn-lg"
                      disabled={loading || !file}
                      style={{
                        borderRadius: "25px",
                        padding: "12px 40px",
                        fontWeight: "600",
                        opacity: loading || !file ? 0.6 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          ANALYZING...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-chart-line me-2"></i>
                          ANALYZE SIGNAL
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info Section */}
                  <div className="text-center">
                    <div className="row justify-content-center">
                      <div className="col-auto">
                        <small className="text-muted">
                          <i className="fas fa-file-csv me-1"></i>
                          CSV Format
                        </small>
                      </div>
                      <div className="col-auto">
                        <small className="text-muted">
                          <i className="fas fa-columns me-1"></i>
                          X,Y Columns
                        </small>
                      </div>
                      <div className="col-auto">
                        <small className="text-muted">
                          <i className="fas fa-weight me-1"></i>
                          Max 10MB
                        </small>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
