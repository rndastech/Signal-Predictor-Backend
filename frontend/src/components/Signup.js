import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password1: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');

    try {
      // Map frontend formData to backend expected fields
      const { password1, password2, ...rest } = formData;
      const payload = {
        ...rest,
        password: password1,
        password_confirm: password2,
      };
      const response = await authService.register(payload);
      
      // Backend returns 201 with 'user' and 'message' on success
      if (response.message) {
        navigate('/email-verification-sent');
      } else {
        setMessage(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error, error.response?.data);
      const data = error.response?.data;
      if (data) {
        // Backend wraps field errors under 'errors'; unwrap if present
        const fieldErrors = data.errors || data;
        setErrors(fieldErrors);
        // Extract a general message: detail or non_field_errors or data.message
        const general = data.detail || data.message || fieldErrors.non_field_errors;
        if (general) {
          setMessage(Array.isArray(general) ? general[0] : general);
        }
      } else {
        setMessage(error.message || 'An error occurred during registration');
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
                    className="fas fa-user-plus"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  CREATE ACCOUNT
                </h2>
                <p className="text-muted fs-6">
                  Join Signal Predictor today
                </p>
              </div>

              <div className="card-body" style={{ padding: "1rem 2rem 2rem" }}>
                {message && (
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
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label text-warning" style={{ fontWeight: "500" }}>
                        <i className="fas fa-user me-2"></i>
                        First Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                          {Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label text-warning" style={{ fontWeight: "500" }}>
                        <i className="fas fa-user me-2"></i>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "10px",
                          color: "#fff",
                        }}
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                          {Array.isArray(errors.last_name) ? errors.last_name[0] : errors.last_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label text-warning" style={{ fontWeight: "500" }}>
                      <i className="fas fa-at me-2"></i>
                      Username *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      required
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    {errors.username && (
                      <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                        {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label text-warning" style={{ fontWeight: "500" }}>
                      <i className="fas fa-envelope me-2"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    {errors.email && (
                      <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                        {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password1" className="form-label text-warning" style={{ fontWeight: "500" }}>
                      <i className="fas fa-lock me-2"></i>
                      Password *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password1 ? 'is-invalid' : ''}`}
                      id="password1"
                      name="password1"
                      value={formData.password1}
                      onChange={handleChange}
                      placeholder="Choose a password"
                      required
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    <small className="form-text text-muted" style={{ color: "#999 !important" }}>
                      Must be at least 8 characters and not too common.
                    </small>
                    {errors.password1 && (
                      <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                        {Array.isArray(errors.password1) ? errors.password1[0] : errors.password1}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password2" className="form-label text-warning" style={{ fontWeight: "500" }}>
                      <i className="fas fa-lock me-2"></i>
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
                      id="password2"
                      name="password2"
                      value={formData.password2}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                    />
                    {errors.password2 && (
                      <div className="invalid-feedback" style={{ color: "#dc3545" }}>
                        {Array.isArray(errors.password2) ? errors.password2[0] : errors.password2}
                      </div>
                    )}
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
                          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                          {' '}Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          {' '}CREATE ACCOUNT
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-warning text-decoration-none">
                      <i className="fas fa-sign-in-alt me-1"></i>
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                By creating an account, you agree to our Terms of Service and Privacy Policy.<br />
                We'll send you a verification email to confirm your email address.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
