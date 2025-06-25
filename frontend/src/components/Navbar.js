import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // merge auth user with fetched profile data for avatar/name
  const displayUser = { ...user, ...(profileData || {}) };

  // load full profile for navbar display
  useEffect(() => {
    if (isAuthenticated) {
      profileAPI.getProfile()
        .then(res => setProfileData(res.data))
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className={`futuristic-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link className="navbar-brand-futuristic" to="/">
          <div className="brand-icon">
            <i className="fas fa-wave-square"></i>
          </div>
          <div className="brand-text">
            <span className="brand-main">SIGNAL</span>
            <span className="brand-sub">PREDICTOR</span>
          </div>
        </Link>
        
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        <div className={`navbar-nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="navbar-nav-main">
            <li className="nav-item-futuristic">
              <Link 
                className={`nav-link-futuristic ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-home nav-icon"></i>
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item-futuristic">
              <Link 
                className={`nav-link-futuristic ${location.pathname === '/upload' ? 'active' : ''}`} 
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-upload nav-icon"></i>
                <span>Upload Signal</span>
              </Link>
            </li>
            <li className="nav-item-futuristic">
              <Link 
                className={`nav-link-futuristic ${location.pathname === '/signal-generator' ? 'active' : ''}`} 
                to="/signal-generator"
                onClick={() => setMobileMenuOpen(false)}
              >
                <i className="fas fa-wave-square nav-icon"></i>
                <span>Generate Signal</span>
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item-futuristic">
                <Link 
                  className={`nav-link-futuristic ${location.pathname === '/analyses' ? 'active' : ''}`} 
                  to="/analyses"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <i className="fas fa-chart-line nav-icon"></i>
                  <span>My Analyses</span>
                </Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav-user">
            {isAuthenticated ? (
              <li className="nav-item-futuristic">
                <div className="user-profile-section">
                  <div className="user-avatar-container">
                    {displayUser.profile_picture ? (
                      <img 
                        src={displayUser.profile_picture} 
                        alt={displayUser.username} 
                        className="user-avatar-img" 
                      />
                    ) : (
                      <div className="user-avatar-placeholder">
                        {displayUser?.username?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      {displayUser.first_name || displayUser.username}
                    </span>
                  </div>
                  <div className="user-actions">
                    <Link className="nav-link-futuristic" to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <i className="fas fa-user nav-icon"></i>
                      <span>Profile</span>
                    </Link>
                    <button className="nav-link-futuristic logout-btn" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt nav-icon"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <>
                <li className="nav-item-futuristic">
                  <Link className="nav-link-futuristic login-link" to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fas fa-sign-in-alt nav-icon"></i>
                    <span>Login</span>
                  </Link>
                </li>
                <li className="nav-item-futuristic">
                  <Link className="btn-signup-futuristic" to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <i className="fas fa-user-plus"></i>
                    <span>Sign Up</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
