import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location: '',
    birth_date: '',
    website: ''
  });
  
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch full profile data from backend
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        const d = response.data;
        setFormData({
          first_name: d.first_name ?? user.first_name ?? '',
          last_name:  d.last_name  ?? user.last_name  ?? '',
          email:      d.email      ?? user.email      ?? '',
          bio:        d.bio        ?? '',
          location:   d.location   ?? '',
          birth_date: d.birth_date ?? '',
          website:    d.website    ?? ''
        });
        if (d.profile_picture) {
          setPreviewUrl(d.profile_picture);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Add user fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add profile picture if selected
      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }      const response = await profileAPI.updateProfile(formDataToSend);
      
      // Update user context with new data
      updateUser(response.data);
      
      setSuccess('Profile updated successfully!');
      
      // Redirect back to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
      
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
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
                    className="fas fa-edit"
                    style={{
                      fontSize: "2rem",
                      color: "#ffc107",
                    }}
                  ></i>
                </div>
                <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                  EDIT PROFILE
                </h2>
                <p className="text-muted fs-6">
                  Update your account information and settings
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
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-4">
                  <div className="col-md-4 text-center">
                    <div className="mb-3">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Profile Preview" 
                          className="rounded-circle" 
                          style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '150px', 
                            height: '150px', 
                            background: 'var(--accent-yellow)', 
                            color: 'var(--bg-primary)', 
                            fontSize: '3rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {user?.username?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-warning">
                        <i className="fas fa-camera me-2"></i>Profile Picture
                      </label>
                      <input 
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {errors.profile_picture && (
                        <div className="text-danger mt-1">
                          <small>{errors.profile_picture}</small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-8">
                    <h6 className="text-warning mb-3">Personal Information</h6>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-warning">
                          <i className="fas fa-user me-2"></i>First Name
                        </label>
                        <input 
                          type="text" 
                          className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                        />
                        {errors.first_name && (
                          <div className="invalid-feedback">
                            {errors.first_name}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-warning">
                          <i className="fas fa-user me-2"></i>Last Name
                        </label>
                        <input 
                          type="text" 
                          className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                        />
                        {errors.last_name && (
                          <div className="invalid-feedback">
                            {errors.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-warning">
                        <i className="fas fa-envelope me-2"></i>Email
                      </label>
                      <input 
                        type="email" 
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-warning">
                          <i className="fas fa-calendar me-2"></i>Birth Date
                        </label>
                        <input 
                          type="date" 
                          className={`form-control ${errors.birth_date ? 'is-invalid' : ''}`}
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleInputChange}
                        />
                        {errors.birth_date && (
                          <div className="invalid-feedback">
                            {errors.birth_date}
                          </div>
                        )}
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-warning">
                          <i className="fas fa-map-marker-alt me-2"></i>Location
                        </label>
                        <input 
                          type="text" 
                          className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                        {errors.location && (
                          <div className="invalid-feedback">
                            {errors.location}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label text-warning">
                        <i className="fas fa-globe me-2"></i>Website
                      </label>
                      <input 
                        type="url" 
                        className={`form-control ${errors.website ? 'is-invalid' : ''}`}
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://..."
                      />
                      {errors.website && (
                        <div className="invalid-feedback">
                          {errors.website}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label text-warning">
                    <i className="fas fa-info-circle me-2"></i>Bio
                  </label>
                  <textarea 
                    className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <div className="invalid-feedback">
                      {errors.bio}
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Changes
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

export default EditProfile;
