import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, signalAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [loading, setLoading] = useState(true);

  // merge auth user with fetched profile data
  const displayUser = { ...user, ...(profileData || {}) };

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadAnalysesData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAnalysesData = async () => {
    try {
      const response = await signalAPI.getAnalyses();
      const analyses = response.data.results || response.data;
      setTotalAnalyses(analyses.length);
      setRecentAnalyses(analyses.slice(0, 5)); // Get 5 most recent
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };
  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
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
                <div className="card-body text-center" style={{ padding: "3rem" }}>
                  <div className="mb-4">
                    <i className="fas fa-spinner fa-spin fa-3x text-warning"></i>
                  </div>
                  <h5 className="text-warning mb-2">Loading Profile</h5>
                  <p className="text-secondary mb-0">Please wait while we fetch your profile data...</p>
                </div>
              </div>
            </div>
          </div>
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
          <div className="col-lg-4">
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "25px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="card-body text-center" style={{ padding: "2rem" }}>
              {displayUser.profile_picture ? (
                <img 
                  src={displayUser.profile_picture} 
                  alt={displayUser.username} 
                  className="rounded-circle mb-3" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    background: 'var(--accent-yellow)', 
                    color: 'var(--bg-primary)', 
                    fontSize: '3rem',
                    fontWeight: 'bold'
                  }}
                >
                  {displayUser.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
              
              <h5 className="mb-1 text-warning">
                {displayUser.first_name || displayUser.last_name
                  ? `${displayUser.first_name || ''} ${displayUser.last_name || ''}`.trim()
                  : displayUser.username
                }
              </h5>
              <p className="text-secondary mb-1">@{displayUser.username}</p>
              {displayUser.location && (
                <p className="text-secondary mb-4">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {displayUser.location}
                </p>
              )}
              
              <div className="d-flex justify-content-center mb-2">
                <button 
                  className="btn btn-warning me-2"
                  onClick={handleEditProfile}
                >
                  <i className="fas fa-edit me-2"></i>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
            <div
            className="card mb-4"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "25px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="card-body" style={{ padding: "2rem" }}>
              <h6 className="d-flex align-items-center mb-3 text-warning" style={{ fontWeight: "600" }}>
                <i className="fas fa-chart-line me-2"></i>
                Analysis Statistics
              </h6>
              <div className="row">
                <div className="col-sm-6">
                  <p className="mb-0 text-muted">Total Analyses</p>
                  <p className="text-warning fw-bold">{totalAnalyses}</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 text-muted">Member Since</p>
                  <p className="text-warning fw-bold">
                    {formatDate(displayUser.date_joined)}
                  </p>
                </div>
              </div>
              
              {/* Quota Usage */}
              {profileData && profileData.quota_total && (
                <>
                  <hr className="bg-secondary" />
                  <p className="mb-2 text-muted">
                    Quota Usage: {totalAnalyses} / {profileData.quota_total}
                  </p>
                  <progress
                    value={totalAnalyses}
                    max={profileData.quota_total}
                    className="w-100"
                    aria-label="Quota usage"
                  >
                    {profileData.quota_percent}%
                  </progress>
                </>
              )}
            </div>
          </div>
        </div>
          <div className="col-lg-8">
          <div
            className="card mb-4"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "25px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="card-body" style={{ padding: "2rem" }}>
              <h5 className="text-warning mb-4" style={{ fontWeight: "600" }}>
                <i className="fas fa-user-cog me-2"></i>
                Profile Information
              </h5>
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <p className="mb-0 text-secondary fw-bold">Full Name</p>
                </div>
                <div className="col-sm-9">
                  <p className="text-warning mb-0">
                    {displayUser.first_name || displayUser.last_name 
                      ? `${displayUser.first_name || ''} ${displayUser.last_name || ''}`.trim()
                      : <em className="text-muted">Not provided</em>
                    }
                  </p>
                </div>
              </div>
              <hr className="text-secondary" />
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <p className="mb-0 text-secondary fw-bold">Email</p>
                </div>
                <div className="col-sm-9">
                  <p className="text-warning mb-0">
                    {displayUser.email || <em className="text-muted">Not provided</em>}
                  </p>
                </div>
              </div>
              <hr className="text-secondary" />
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <p className="mb-0 text-secondary fw-bold">Website</p>
                </div>
                <div className="col-sm-9">
                  <p className="text-warning mb-0">
                    {displayUser.website ? (
                      <a href={displayUser.website} target="_blank" rel="noopener noreferrer" className="text-warning">
                        {displayUser.website}
                      </a>
                    ) : (
                      <em className="text-muted">Not provided</em>
                    )}
                  </p>
                </div>
              </div>
              <hr className="text-secondary" />
              
              <div className="row mb-3">
                <div className="col-sm-3">
                  <p className="mb-0 text-secondary fw-bold">Birth Date</p>
                </div>
                <div className="col-sm-9">
                  <p className="text-warning mb-0">
                    {displayUser.birth_date 
                      ? formatDate(displayUser.birth_date)
                      : <em className="text-muted">Not provided</em>
                    }
                  </p>
                </div>
              </div>
              
              {displayUser.bio && (
                <>
                  <hr className="text-secondary" />
                  <div className="row mb-3">
                    <div className="col-sm-3">
                      <p className="mb-0 text-secondary fw-bold">Bio</p>
                    </div>
                    <div className="col-sm-9">
                      <p className="text-warning mb-0">{displayUser.bio}</p>
                    </div>
                  </div>
                </>
              )}
              
              <hr className="text-secondary" />
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-warning"
                  onClick={handleChangePassword}
                >
                  <i className="fas fa-key me-2"></i>
                  Change Password
                </button>
              </div>
            </div>
          </div>
            {recentAnalyses.length > 0 && (
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
              <div className="card-header d-flex justify-content-between align-items-center" style={{ background: "transparent", border: "none", padding: "1.5rem 2rem 1rem" }}>
                <h6 className="mb-0 text-warning" style={{ fontWeight: "600" }}>
                  <i className="fas fa-clock me-2"></i>
                  Recent Analyses
                </h6>
                <button 
                  className="btn btn-sm btn-outline-warning"
                  onClick={() => navigate('/analyses')}
                  style={{
                    borderRadius: "15px",
                    padding: "5px 15px",
                  }}
                >
                  View All
                </button>
              </div>
              <div className="card-body" style={{ padding: "0 2rem 2rem" }}>
                <div className="list-group list-group-flush">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-secondary">
                      <div>
                        <h6 className="mb-1 text-warning">
                          {analysis.display_name || analysis.name || 'Untitled Analysis'}
                        </h6>
                        <small className="text-secondary">
                          {formatDate(analysis.created_at)}
                        </small>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
