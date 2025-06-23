import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PropTypes from 'prop-types';
import '../css/Layout.css';

// Layout component to mimic Django base.html structure with navbar and alerts
const Layout = ({ children, messages = [] }) => {  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container" style={{ paddingTop: '10px', position: 'relative' }}>
          {/* Alert messages section */}
          {messages.map((msg) => (
            <div
              key={msg.text}  // use message text as key
              className={`alert alert-${msg.type} alert-dismissible fade show`}
              role="alert"
            >
              <i className="fas fa-info-circle me-2"></i> {msg.text}
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
              ></button>
            </div>
          ))}
          {/* Main content area */}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired
    })
  )
};

export default Layout;
