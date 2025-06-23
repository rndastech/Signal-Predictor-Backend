import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      const response = await authService.register(formData);
      
      if (response.success) {
        navigate('/email-verification-sent');
      } else {
        setMessage(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage(error.message || 'An error occurred during registration');
      if (error.errors) {
        setErrors(error.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white text-center">
              <h3 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Create Your Account
              </h3>
              <p className="mb-0 mt-2">Join Signal Predictor today</p>
            </div>
            <div className="card-body">
              {message && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">
                      <i className="fas fa-user text-primary me-2"></i>
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
                    />
                    {errors.first_name && (
                      <div className="invalid-feedback">
                        {errors.first_name}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">
                      <i className="fas fa-user text-primary me-2"></i>
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
                    />
                    {errors.last_name && (
                      <div className="invalid-feedback">
                        {errors.last_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    <i className="fas fa-at text-primary me-2"></i>
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
                  />
                  {errors.username && (
                    <div className="invalid-feedback">
                      {errors.username}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope text-primary me-2"></i>
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
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password1" className="form-label">
                    <i className="fas fa-lock text-primary me-2"></i>
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
                  />
                  <small className="form-text text-muted">
                    Must be at least 8 characters and not too common.
                  </small>
                  {errors.password1 && (
                    <div className="invalid-feedback">
                      {errors.password1}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password2" className="form-label">
                    <i className="fas fa-lock text-primary me-2"></i>
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
                  />
                  {errors.password2 && (
                    <div className="invalid-feedback">
                      {errors.password2}
                    </div>
                  )}
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="card-footer text-center">
              <p className="mb-0">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Sign in here
                </Link>
              </p>
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
  );
};

export default Signup;
