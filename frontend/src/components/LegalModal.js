import React from 'react';
import PropTypes from 'prop-types';
import '../css/LegalModal.css';

const LegalModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: (
            <div className="legal-content">
              <h4>Privacy Policy for Signal Predictor</h4>
              <p><strong>Effective Date:</strong> June 24, 2025</p>
              
              <h5>1. Information We Collect</h5>
              <p>We collect information you provide directly to us, such as when you create an account, upload signal data, or contact us for support.</p>
              
              <h5>2. How We Use Your Information</h5>
              <ul>
                <li>To provide and maintain our signal analysis services</li>
                <li>To process and analyze your uploaded signal data</li>
                <li>To improve our machine learning algorithms</li>
                <li>To communicate with you about our services</li>
              </ul>
              
              <h5>3. Data Security</h5>
              <p>We implement appropriate security measures to protect your personal information and signal data against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h5>4. Data Retention</h5>
              <p>We retain your signal analysis data for as long as your account is active or as needed to provide you services. You may delete your analyses at any time.</p>
              
              <h5>5. Third-Party Services</h5>
              <p>Our application may use third-party services for analytics and hosting. These services have their own privacy policies governing the use of your information.</p>
              
              <h5>6. Contact Information</h5>
              <p>If you have any questions about this Privacy Policy, please contact us through the support section.</p>
            </div>
          )
        };
      
      case 'cookies':
        return {
          title: 'Cookie Policy',
          content: (
            <div className="legal-content">
              <h4>Cookie Policy for Signal Predictor</h4>
              <p><strong>Effective Date:</strong> June 24, 2025</p>
              
              <h5>1. What Are Cookies</h5>
              <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and settings.</p>
              
              <h5>2. Types of Cookies We Use</h5>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and session management</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our application to improve performance</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a better user experience</li>
              </ul>
              
              <h5>3. How We Use Cookies</h5>
              <ul>
                <li>To keep you logged in during your session</li>
                <li>To remember your analysis preferences</li>
                <li>To improve our application performance</li>
                <li>To provide personalized features</li>
              </ul>
              
              <h5>4. Managing Cookies</h5>
              <p>You can control and manage cookies through your browser settings. However, please note that disabling certain cookies may affect the functionality of our application.</p>
              
              <h5>5. Cookie Consent</h5>
              <p>By using our application, you consent to the use of cookies as described in this policy.</p>
            </div>
          )
        };
      
      case 'license':
        return {
          title: 'MIT License',
          content: (
            <div className="legal-content">
              <h4>MIT License</h4>
              <p><strong>Copyright (c) 2025 Ritesh Narayan Das</strong></p>
              
              <p>Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:</p>
              
              <p>The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.</p>
              
              <p><strong>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.</strong></p>
              
              <h5>What this means:</h5>
              <ul>
                <li>✅ Commercial use allowed</li>
                <li>✅ Modification allowed</li>
                <li>✅ Distribution allowed</li>
                <li>✅ Private use allowed</li>
                <li>❗ License and copyright notice required</li>
                <li>❌ No warranty provided</li>
                <li>❌ No liability accepted</li>
              </ul>
              
              <h5>Open Source Components</h5>
              <p>This project uses various open-source libraries and frameworks, each with their own licenses. 
              Please refer to the individual package documentation for specific license information.</p>
            </div>
          )
        };
      
      default:
        return { title: '', content: null };
    }
  };
  const { title, content } = getContent();

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h3 className="legal-modal-title">{title}</h3>
          <button className="legal-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="legal-modal-body">
          {content}
        </div>
        <div className="legal-modal-footer">
          <button className="legal-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;

LegalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['privacy', 'cookies', 'license']).isRequired,
};
