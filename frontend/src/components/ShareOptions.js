import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { signalAPI } from '../services/api';

const ShareOptions = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    is_public: false,
    password: ''
  });
  useEffect(() => {
    fetchShareOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  const fetchShareOptions = async () => {
    try {
      setLoading(true);
      const response = await signalAPI.getShareOptions(analysisId);
      const data = response.data;
      setAnalysis(data);
      setFormData({
        is_public: data.is_public,
        password: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load share options');
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/analysis'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await signalAPI.updateShareOptions(analysisId, formData);
      
      if (response.data.success) {
        setSuccess('Share settings updated successfully!');
        // Update local analysis data
        setAnalysis({
          ...analysis,
          is_public: response.data.is_public,
          has_password: response.data.has_password,
          public_url: response.data.public_url
        });
        // Clear password field after successful save
        setFormData({ ...formData, password: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update share settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.warn('Failed to copy URL:', err);
      setError('Failed to copy URL');
      setTimeout(() => setError(''), 3000);
    }
  };
  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ paddingTop: "120px", background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)" }}
      >
        <div className="text-center">          <div className="spinner-border text-warning mb-3" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light fs-5">Loading share options...</p>
        </div>
      </div>
    );
  }
  return (
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
          <div className="col-12 col-xl-10">            {/* Header Card */}
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
              }}
            >
              <div className="card-header border-0 bg-transparent py-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                  <div>
                    <h1
                      className="mb-2 text-light d-flex align-items-center gap-3"
                      style={{ fontSize: "2.5rem", fontWeight: "700" }}
                    >                      <i
                        className="fas fa-share-alt"
                        style={{
                          color: "#ffc107",
                          textShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
                        }}
                      ></i>{' '}
                      SHARE SETTINGS
                    </h1>
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                      <small className="text-muted fs-6">({analysis?.name || `Analysis #${analysisId}`})</small>
                      <span
                        className="badge px-3 py-2"
                        style={{
                          background: analysis?.is_public 
                            ? "linear-gradient(45deg, #28a745, #20c997)" 
                            : "linear-gradient(45deg, #6c757d, #495057)",
                          borderRadius: "25px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                        }}
                      >
                        <i className={`fas ${analysis?.is_public ? 'fa-globe' : 'fa-lock'} me-1`}></i>
                        {analysis?.is_public ? 'PUBLIC' : 'PRIVATE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div
              className="card"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="card-body p-5">
                {error && (
                  <div
                    className="alert mb-4 p-4 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      color: "#f8d7da",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div
                    className="alert mb-4 p-4 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)",
                      border: "1px solid rgba(40, 167, 69, 0.3)",
                      color: "#d1e7dd",
                    }}
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Public Toggle Section */}
                  <div className="mb-5">                    <h5 className="text-light mb-3 d-flex align-items-center">
                      <i className="fas fa-globe me-2" style={{ color: "#ffc107" }}></i>{' '}
                      Public Access
                    </h5>
                    <div
                      className="form-check p-4 rounded-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <input 
                        className="form-check-input me-3" 
                        type="checkbox" 
                        id="is_public"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleInputChange}
                        style={{
                          transform: "scale(1.3)",
                          accentColor: "#ffc107"
                        }}
                      />
                      <div>
                        <label className="form-check-label text-light fw-bold" htmlFor="is_public">
                          Make Public
                        </label>
                        <div className="text-muted mt-2">
                          Allow others to view this analysis via a shared link.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Password Section */}
                  <div className="mb-5">                    <h5 className="text-light mb-3 d-flex align-items-center">
                      <i className="fas fa-key me-2" style={{ color: "#ffc107" }}></i>{' '}
                      Password Protection
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        background: formData.is_public 
                          ? "rgba(255, 255, 255, 0.05)" 
                          : "rgba(108, 117, 125, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        opacity: formData.is_public ? 1 : 0.6,
                      }}
                    >
                      <label htmlFor="password" className="form-label text-light fw-bold">Share Password</label>
                      <input 
                        type="password" 
                        className="form-control mt-2" 
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={analysis?.has_password ? "Enter new password (leave blank to keep current)" : "Enter password (optional)"}
                        disabled={!formData.is_public}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                          borderRadius: "10px",
                          padding: "12px 16px",
                        }}
                      />
                      <div className="text-muted mt-3">
                        {formData.is_public 
                          ? "Optional password for shared link. Viewers will need to enter this password to access the analysis."
                          : "Password protection is only available for public analyses."
                        }
                      </div>
                      {analysis?.has_password && formData.is_public && (
                        <div className="mt-3">
                          <small
                            className="px-3 py-2 rounded-pill"
                            style={{
                              background: "rgba(23, 162, 184, 0.2)",
                              color: "#bee5eb",
                              border: "1px solid rgba(23, 162, 184, 0.3)",
                            }}
                          >                            <i className="fas fa-info-circle me-1"></i>{' '}
                            This analysis currently has password protection enabled.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Save Button */}
                  <div className="d-flex justify-content-start mb-4">                    <button 
                      type="submit" 
                      className="btn px-5 py-3"
                      disabled={saving}
                      style={{
                        background: saving 
                          ? "rgba(255, 193, 7, 0.6)" 
                          : "linear-gradient(45deg, #ffc107, #ffeb3b)",
                        border: "none",
                        borderRadius: "25px",
                        color: "#000",
                        fontWeight: "700",
                        fontSize: "1.1rem",
                        transition: "all 0.3s ease",
                        textShadow: "none",
                      }}
                      onMouseOver={(e) => {
                        if (!saving) {
                          e.target.style.transform = "translateY(-3px)"
                          e.target.style.boxShadow = "0 10px 30px rgba(255, 193, 7, 0.4)"
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                      }}
                      onFocus={(e) => {
                        if (!saving) {
                          e.target.style.transform = "translateY(-3px)"
                          e.target.style.boxShadow = "0 10px 30px rgba(255, 193, 7, 0.4)"
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                      }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>{' '}
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>{' '}
                          SAVE SETTINGS
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Public URL Section */}
                {analysis?.is_public && (
                  <div className="mt-5">                    <h5 className="text-light mb-3 d-flex align-items-center">
                      <i className="fas fa-link me-2" style={{ color: "#ffc107" }}></i>{' '}
                      Public URL
                    </h5>
                    <div
                      className="p-4 rounded-3"
                      style={{
                        background: "rgba(40, 167, 69, 0.1)",
                        border: "1px solid rgba(40, 167, 69, 0.3)",
                      }}
                    >
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          readOnly 
                          value={analysis.public_url || `${window.location.origin}/share/${analysisId}`}
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#fff",
                            borderRadius: "10px 0 0 10px",
                            padding: "12px 16px",
                          }}
                        />                        <button 
                          className="btn"
                          type="button"
                          onClick={() => copyToClipboard(analysis.public_url || `${window.location.origin}/share/${analysisId}`)}
                          style={{
                            background: "linear-gradient(45deg, #17a2b8, #20c997)",
                            border: "none",
                            borderRadius: "0 10px 10px 0",
                            color: "#fff",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = "scale(1.05)"
                            e.target.style.boxShadow = "0 5px 15px rgba(23, 162, 184, 0.4)"
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = "scale(1)"
                            e.target.style.boxShadow = "none"
                          }}
                          onFocus={(e) => {
                            e.target.style.transform = "scale(1.05)"
                            e.target.style.boxShadow = "0 5px 15px rgba(23, 162, 184, 0.4)"
                          }}
                          onBlur={(e) => {
                            e.target.style.transform = "scale(1)"
                            e.target.style.boxShadow = "none"
                          }}
                        >
                          <i className="fas fa-copy me-2"></i>{' '}
                          COPY
                        </button>
                      </div>
                      <div className="mt-3">
                        <small className="text-muted">
                          Share this link to let others view your analysis
                          {analysis?.has_password && " (they will need the password you set)"}.
                        </small>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Back Button */}
                <div className="mt-5">                  <Link 
                    to={`/analysis/${analysisId}`} 
                    className="btn px-4 py-3 text-decoration-none"
                    style={{
                      background: "transparent",
                      border: "2px solid #6c757d",
                      borderRadius: "25px",
                      color: "#6c757d",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)"
                      e.target.style.boxShadow = "0 8px 25px rgba(108, 117, 125, 0.4)"
                      e.target.style.color = "#fff"
                      e.target.style.borderColor = "#fff"
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "none"
                      e.target.style.color = "#6c757d"
                      e.target.style.borderColor = "#6c757d"
                    }}
                    onFocus={(e) => {
                      e.target.style.transform = "translateY(-2px)"
                      e.target.style.boxShadow = "0 8px 25px rgba(108, 117, 125, 0.4)"
                      e.target.style.color = "#fff"
                      e.target.style.borderColor = "#fff"
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "none"
                      e.target.style.color = "#6c757d"
                      e.target.style.borderColor = "#6c757d"
                    }}
                  ><i className="fas fa-arrow-left me-2"></i>{' '}
                    BACK TO ANALYSIS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareOptions;
