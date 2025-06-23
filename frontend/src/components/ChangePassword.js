import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    // Validate passwords match
    if (formData.new_password !== formData.confirm_password) {
      setErrors({ confirm_password: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      
      setSuccess('Password changed successfully!');
      
      // Clear form
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('Password change error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to change password. Please try again.' });
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
                    className="fas fa-key"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  CHANGE PASSWORD
                </h2>
                <p className="text-muted fs-6">
                  Update your account password for security
                </p>
              </div>

              <div className="card-body" style={{ padding: "1rem 2rem 2rem" }}>              {success && (
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
                  <i className="fas fa-check me-2"></i>
                  {success}
                </div>
              )}

              {errors.general && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-warning">
                    <i className="fas fa-lock me-2"></i>Current Password
                  </label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.current_password ? 'is-invalid' : ''}`}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.current_password && (
                    <div className="invalid-feedback">
                      {errors.current_password}
                    </div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-warning">
                    <i className="fas fa-key me-2"></i>New Password
                  </label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                  />
                  {errors.new_password && (
                    <div className="invalid-feedback">
                      {errors.new_password}
                    </div>
                  )}
                  <div className="form-text">
                    Password must be at least 8 characters long.
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label text-warning">
                    <i className="fas fa-key me-2"></i>Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.confirm_password && (
                    <div className="invalid-feedback">
                      {errors.confirm_password}
                    </div>
                  )}
                </div>
                
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Change Password
                      </>
                    )}
                  </button>                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
