import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await requestPasswordReset({ email });
      setMessage('If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request password reset.');
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
                    className="fas fa-key"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  FORGOT PASSWORD
                </h2>
                <p className="text-muted fs-6">
                  Reset your Signal Predictor password
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
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label text-warning" style={{ fontWeight: "500" }}>
                      <i className="fas fa-envelope me-2"></i>Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
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
                          {' '}Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          {' '}SEND RESET LINK
                        </>
                      )}
                    </button>
                  </div>
                </form>
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

export default ForgotPassword;
