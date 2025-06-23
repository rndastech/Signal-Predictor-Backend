import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signalAPI } from '../services/api';

const AnalysisSharePassword = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await signalAPI.accessPasswordProtectedAnalysis(analysisId, password);
      
      if (response.data.analysis) {
        // Password was correct, navigate to shared analysis view
        navigate(`/share/${analysisId}`, { 
          state: { analysis: response.data.analysis } 
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ paddingTop: '80px' }}>
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>
                <i className="fas fa-lock"></i> Password Required
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </div>
              )}
              
              <p>
                This analysis is password-protected. Please enter the password to view it:
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {' '}Verifying...
                    </>
                  ) : (
                    'Submit'                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSharePassword;
