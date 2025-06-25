import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../services/authService';

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('Verifying your email...');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authService.verifyEmail(uid, token);
        if (response.success) {
          setStatus('Your email has been verified! You can now log in.');
          setIsVerified(true);
        } else {
          setStatus(response.message || 'Verification failed.');
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('Verification link is invalid or expired.');
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [uid, token]);

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
                    background: `linear-gradient(135deg, ${isVerified ? 'rgba(40, 167, 69, 0.1)' : 'rgba(255, 193, 7, 0.1)'} 0%, ${isVerified ? 'rgba(40, 167, 69, 0.05)' : 'rgba(255, 193, 7, 0.05)'} 100%)`,
                    borderRadius: "50%",
                    width: "80px",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    border: `2px solid ${isVerified ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)'}`,
                  }}
                >
                  {isLoading ? (
                    <div className="spinner-border text-warning" aria-label="Loading verification status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <i
                      className={`fas ${isVerified ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}
                      style={{
                        fontSize: "2rem",
                        color: isVerified ? "#28a745" : "#ffc107",
                      }}
                    ></i>
                  )}
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  EMAIL VERIFICATION
                </h2>
                <p className="text-muted fs-6">
                  Signal Predictor Account Verification
                </p>
              </div>

              <div className="card-body text-center" style={{ padding: "1rem 2rem 2rem" }}>
                <div
                  className={`alert ${isVerified ? 'alert-success' : 'alert-info'}`}
                  style={{
                    background: `rgba(${isVerified ? '40, 167, 69' : '13, 202, 240'}, 0.1)`,
                    border: `1px solid rgba(${isVerified ? '40, 167, 69' : '13, 202, 240'}, 0.3)`,
                    borderRadius: "10px",
                    color: isVerified ? "#28a745" : "#0dcaf0",
                    marginBottom: "1.5rem",
                  }}
                >
                  <i className={`fas ${isVerified ? 'fa-check-circle' : 'fa-info-circle'} me-2`}></i>
                  {status}
                </div>

                {isVerified && (
                  <div className="text-center">
                    <Link
                      to="/login"
                      className="btn btn-warning btn-lg"
                      style={{
                        borderRadius: "25px",
                        padding: "12px 40px",
                        fontWeight: "600",
                        textDecoration: "none",
                      }}
                    >
                      <i className="fas fa-sign-in-alt me-2" aria-hidden="true"></i>GO TO LOGIN
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
