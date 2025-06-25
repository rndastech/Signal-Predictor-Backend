import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirm: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { confirmPasswordReset } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await confirmPasswordReset({ uid, token, ...formData });
      setMessage('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(' ');
        setError(messages);
      } else {
        setError('Failed to reset password.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className="col-lg-6 col-xl-5">
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
                    className="fas fa-shield-alt"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  RESET PASSWORD
                </h2>
                <p className="text-muted fs-6">
                  Set your new Signal Predictor password
                </p>
              </div>

              <div className="card-body" style={{ padding: "1rem 2rem 2rem" }}>
                {message && (
                  <div
                    className="alert alert-success"
                    style={{
                      background: "rgba(25, 135, 84, 0.1)",
                      border: "1px solid rgba(25, 135, 84, 0.3)",
                      borderRadius: "10px",
                      color: "#198754",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    {message}
                    {' '}<Link to="/login" className="text-warning text-decoration-none">log in</Link>.
                  </div>
                )}
                {error && (
                  <div
                    className="alert alert-danger"
                    style={{
                      background: "rgba(220, 53, 69, 0.1)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      borderRadius: "10px",
                      color: "#dc3545",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
                {!message && (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="new_password" className="form-label text-warning" style={{ fontWeight: "500" }}>
                        <i className="fas fa-lock me-2"></i>New Password
                      </label>
                      <input
                        type="password"
                        id="new_password"
                        name="new_password"
                        className="form-control"
                        value={formData.new_password}
                        onChange={handleChange}
                        placeholder="Enter your new password"
                        required
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="new_password_confirm" className="form-label text-warning" style={{ fontWeight: "500" }}>
                        <i className="fas fa-lock me-2"></i>Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="new_password_confirm"
                        name="new_password_confirm"
                        className="form-control"
                        value={formData.new_password_confirm}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        required
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                    </div>
                    <div className="text-center mb-4">
                      <button
                        type="submit"
                        className="btn btn-warning btn-lg"
                        disabled={loading}
                        style={{
                          borderRadius: "25px",
                          padding: "12px 40px",
                          fontWeight: "600",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {' '}Resetting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-sync-alt me-2"></i>
                            {' '}RESET PASSWORD
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
                <div className="text-center">
                  <Link to="/login" className="text-warning text-decoration-none">
                    <i className="fas fa-arrow-left me-2"></i>
                    {' '}Back to login
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

export default ResetPasswordConfirm;
