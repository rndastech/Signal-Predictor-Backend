import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import LegalModal from './LegalModal';
import '../css/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [modalState, setModalState] = useState({ isOpen: false, type: null });

  const openModal = (type) => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null });
  };

  return (
    <footer className="futuristic-footer">
      <div className="container-fluid">
        <div className="footer-content">
          {/* Top Section */}
          <div className="row">
            {/* Logo and Brand Section */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-brand">
                <div className="footer-logo">
                  <i className="fas fa-wave-square logo-icon"></i>
                  <span className="logo-text">SIGNAL PREDICTOR</span>
                </div>
                <p className="footer-description">
                  Advanced AI-Powered Signal Analysis & Predictive Modeling. 
                  Harness the power of Fourier Transform and machine learning 
                  for comprehensive signal analysis.
                </p>
                <div className="footer-social">
                  <a href="https://github.com/rndastech/Signal-Predictor" className="social-link" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href="https://www.linkedin.com/in/ritesh-narayan-das-6196b3268/" className="social-link" aria-label="LinkedIn">
                    <i className="fab fa-linkedin"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5 className="footer-title">FEATURES</h5>
                <ul className="footer-links">
                  <li><Link to="/upload">Upload Signal</Link></li>
                  <li><Link to="/signal-generator">Generate Signal</Link></li>
                  <li><Link to="/analyses">View Analytics</Link></li>
                </ul>
              </div>
            </div>            {/* About Me */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5 className="footer-title">ABOUT ME</h5>
                <ul className="footer-links">
                  <li><a href="https://rndastech.github.io" target="_blank" rel="noopener noreferrer">Portfolio Website</a></li>
                  <li><a href="https://leetcode.com/u/rn_das_2004" target="_blank" rel="noopener noreferrer">Leetcode Profile</a></li>
                  <li><a href="https://codeforces.com/profile/rn_das_2004" target="_blank" rel="noopener noreferrer">CodeForces Profile</a></li>
                </ul>
              </div>
            </div>

            {/* Support */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5 className="footer-title">SUPPORT</h5>
                <ul className="footer-links">
                  <li><a href="#contact">Contact Me</a></li>
                  <li><a href="#status">System Status</a></li>
                </ul>
              </div>
            </div>            {/* Legal */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5 className="footer-title">LEGAL</h5>
                <ul className="footer-links">
                  <li><button onClick={() => openModal('privacy')} className="footer-link-button">Privacy Policy</button></li>
                  <li><button onClick={() => openModal('cookies')} className="footer-link-button">Cookie Policy</button></li>
                  <li><button onClick={() => openModal('license')} className="footer-link-button">License</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider"></div>

          {/* Bottom Section */}
          <div className="footer-bottom">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="footer-copyright">
                  © {currentYear} Ritesh Narayan Das. All rights reserved.
                </p>
              </div>
              <div className="col-md-6">
                <div className="footer-meta">                  <span className="powered-by">
                    <i className="fas fa-bolt"></i>{' '}
                    Powered by AI & Machine Learning
                  </span>
                </div>
              </div>
            </div>          </div>        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        type={modalState.type} 
      />
    </footer>
  );
};

export default Footer;
