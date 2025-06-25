import React from 'react';

const EmailVerificationSent = () => (
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
                  background: "linear-gradient(135deg, rgba(13, 202, 240, 0.1) 0%, rgba(13, 202, 240, 0.05) 100%)",
                  borderRadius: "50%",
                  width: "80px",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  border: "2px solid rgba(13, 202, 240, 0.2)",
                }}
              >
                <i
                  className="fas fa-envelope"
                  style={{
                    fontSize: "2rem",
                    color: "#0dcaf0",
                  }}
                ></i>
              </div>
              <h2 className="text-light mb-2" style={{ fontWeight: "700" }}>
                VERIFICATION EMAIL SENT
              </h2>
              <p className="text-muted fs-6">
                Signal Predictor Account Activation
              </p>
            </div>

            <div className="card-body text-center" style={{ padding: "1rem 2rem 2rem" }}>
              <div
                className="alert alert-info"
                style={{
                  background: "rgba(13, 202, 240, 0.1)",
                  border: "1px solid rgba(13, 202, 240, 0.3)",
                  borderRadius: "10px",
                  color: "#0dcaf0",
                  marginBottom: "1.5rem",
                }}
              >
                <i className="fas fa-info-circle me-2" aria-hidden="true"></i>Please check your email inbox for a verification link to activate your account.
              </div>

              <div className="text-center mb-4">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default EmailVerificationSent;
