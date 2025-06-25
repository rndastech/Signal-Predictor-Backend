import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { signalAPI, profileAPI } from "../services/api"

const Home = () => {
  const { user, isAuthenticated } = useAuth()
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [totalAnalyses, setTotalAnalyses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    setMounted(true)
    fetchHomeData()
  }, [isAuthenticated])

  // load full profile data for avatar and name
  useEffect(() => {
    if (isAuthenticated) {
      profileAPI.getProfile()
        .then(res => setProfileData(res.data))
        .catch(console.error)
    }
  }, [isAuthenticated])

  // merge auth user with fetched profile data
  const displayUser = { ...user, ...(profileData || {}) }

  const fetchHomeData = async () => {
    setLoading(true)
    try {
      const response = await signalAPI.getHome()
      setRecentAnalyses(response.data.recent_analyses || [])
      setTotalAnalyses(response.data.total_analyses || 0)
    } catch (error) {
      console.error("Failed to fetch home data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!mounted) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="futuristic-home">
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>      <div className="container-fluid position-relative">
        {/* Hero Section */}
        <div className="hero-section text-center mb-1">
          <div className="hero-badge">
            <i className="fas fa-sparkles"></i>
            <span>AI-Powered Signal Analysis</span>
          </div>

          <h1 className="hero-title">SIGNAL PREDICTOR</h1>

          <p className="hero-subtitle">Advanced AI-Powered Signal Analysis & Predictive Modeling</p>

          <div className="hero-buttons">
            <Link to="/upload" className="btn btn-primary-futuristic btn-lg me-3">
              <i className="fas fa-rocket"></i> START ANALYSIS
            </Link>
            <Link to="/signal-generator" className="btn btn-secondary-futuristic btn-lg">
              <i className="fas fa-magic"></i> GENERATE SIGNAL
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card futuristic-card main-card">
              <div className="card-body p-5">
                {isAuthenticated ? (
                  <>
                    {/* User Welcome Section */}
                    <div className="user-welcome-section">
                      <div className="d-flex align-items-center">
                        <div className="user-avatar-container">
                          {displayUser.profile_picture ? (
                            <img
                              src={displayUser.profile_picture || "/placeholder.svg"}
                              alt={displayUser.username}
                              className="user-avatar"
                            />
                          ) : (
                            <div className="user-avatar user-avatar-fallback">
                              {displayUser?.username?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <h3 className="user-welcome-text">
                            <i className="fas fa-user me-2"></i>
                            Welcome back, {displayUser.first_name ? displayUser.first_name : displayUser.username}!
                          </h3>
                          <Link to="/profile" className="profile-link">
                            Manage Profile <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="row mb-5">
                      <div className="col-md-6 mb-4">
                        <div className="card futuristic-card stats-card stats-card-primary">
                          <div className="card-body text-center">
                            <div className="stats-icon-container">
                              <i className="fas fa-chart-line stats-icon"></i>
                            </div>
                            <h3 className="stats-number">
                              {loading ? (
                                <div className="loading-dots">...</div>
                              ) : (
                                <span className="counter-animation">{totalAnalyses}</span>
                              )}
                            </h3>
                            <p className="stats-label">Total Analyses</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6 mb-4">
                        <div className="card futuristic-card stats-card stats-card-secondary">
                          <div className="card-body text-center">
                            <div className="stats-icon-container">
                              <i className="fas fa-clock stats-icon"></i>
                            </div>
                            <h3 className="stats-number">
                              {loading ? (
                                <div className="loading-dots">...</div>
                              ) : (
                                <span className="counter-animation">{recentAnalyses.length}</span>
                              )}
                            </h3>
                            <p className="stats-label">Recent Analyses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="guest-welcome-section">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-rocket me-3 guest-icon"></i>
                      <div>
                        <h4 className="guest-title">Join the Future of Signal Analysis</h4>
                        <p className="guest-subtitle">Sign up to save your analyses and unlock advanced features!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="description-section text-center mb-5">
                  <p className="description-text">
                    Harness the power of Fourier Transform and AI-driven multi-sinusoidal curve fitting. Upload your
                    data or generate synthetic signals for comprehensive analysis and predictive modeling.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="row">
                  <div className="col-lg-4 mb-4">
                    <div className="card futuristic-card feature-card feature-card-upload h-100">
                      <div className="card-body text-center d-flex flex-column">
                        <div className="feature-icon-container mb-4">
                          <i className="fas fa-upload feature-icon"></i>
                        </div>
                        <h5 className="feature-title">UPLOAD SIGNAL DATA</h5>
                        <p className="feature-description flex-grow-1">
                          Upload CSV files with your signal data (x, y columns) for instant AI-powered analysis.
                        </p>
                        <div className="feature-actions">
                          <Link to="/upload" className="btn btn-feature-upload w-100 mb-3">
                            <i className="fas fa-upload me-2"></i> UPLOAD CSV
                          </Link>
                          {!isAuthenticated && (
                            <div className="feature-note">
                              <i className="fas fa-lock me-2"></i>
                              Login required to save results
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 mb-4">
                    <div className="card futuristic-card feature-card feature-card-generate h-100">
                      <div className="card-body text-center d-flex flex-column">
                        <div className="feature-icon-container mb-4">
                          <i className="fas fa-magic feature-icon"></i>
                        </div>
                        <h5 className="feature-title">GENERATE SIGNALS</h5>
                        <p className="feature-description flex-grow-1">
                          Create synthetic sinusoidal signals with custom or randomized parameters for testing.
                        </p>
                        <div className="feature-actions">
                          <Link to="/signal-generator" className="btn btn-feature-generate w-100 mb-3">
                            <i className="fas fa-magic me-2"></i> GENERATE SIGNAL
                          </Link>
                          <div className="feature-note">
                            <i className="fas fa-flask me-2"></i>
                            Perfect for algorithm testing
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 mb-4">
                    <div className="card futuristic-card feature-card feature-card-analytics h-100">
                      <div className="card-body text-center d-flex flex-column">
                        <div className="feature-icon-container mb-4">
                          <i className="fas fa-chart-bar feature-icon"></i>
                        </div>
                        <h5 className="feature-title">VIEW ANALYTICS</h5>
                        <p className="feature-description flex-grow-1">
                          Browse and review your previous signal analysis results and fitted functions.
                        </p>
                        <div className="feature-actions">
                          {isAuthenticated ? (
                            <Link to="/analyses" className="btn btn-feature-analytics w-100">
                              <i className="fas fa-chart-bar me-2"></i> MY ANALYTICS
                            </Link>
                          ) : (
                            <Link to="/signup" className="btn btn-feature-analytics w-100">
                              <i className="fas fa-user-plus me-2"></i> SIGN UP NOW
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Analyses Section */}
        {isAuthenticated && recentAnalyses.length > 0 && (
          <div className="row justify-content-center mt-5">
            <div className="col-lg-10">
              <div className="card futuristic-card recent-analyses-card">
                <div className="card-header recent-analyses-header">
                  <h5 className="mb-0 d-flex align-items-center">
                    <div className="recent-analyses-icon-container me-3">
                      <i className="fas fa-clock"></i>
                    </div>
                    RECENT ANALYSES
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="recent-analyses-list">
                    {recentAnalyses.map((analysis, index) => (
                      <div
                        key={analysis.id}
                        className="recent-analysis-item"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <i className="fas fa-wave-square me-3 analysis-icon"></i>
                              <h6 className="analysis-name mb-0">{analysis.display_name || analysis.name}</h6>
                            </div>
                            <p className="analysis-date mb-2">{formatDate(analysis.created_at)}</p>
                            {analysis.mse && (
                              <div className="analysis-badge">
                                <i className="fas fa-bolt me-1"></i>
                                MSE: {Number.parseFloat(analysis.mse).toFixed(6)}
                              </div>
                            )}
                          </div>
                          <div>
                            <Link to={`/analysis/${analysis.id}`} className="btn btn-view-analysis">
                              <i className="fas fa-eye me-2"></i>
                              VIEW
                              <i className="fas fa-chevron-right ms-1"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>        )}
      </div>

      <style>{`
        .futuristic-home {
          min-height: 100vh;
          background: #000 !important;
          color: #ffffff;
          overflow-x: hidden;
          position: relative;
        }

        .bg-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          top: -150px;
          right: -150px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 250px;
          height: 250px;
          background: linear-gradient(45deg, #8b5cf6, #a855f7);
          bottom: -125px;
          left: -125px;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #404040, #606060);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        .loading-screen {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top: 3px solid #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .hero-section {
          padding: 80px 0 20px;
          position: relative;
          z-index: 1;
          animation: fadeInUp 1s ease-out;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 50px;
          padding: 12px 24px;
          margin-bottom: 30px;
          backdrop-filter: blur(10px);
          font-size: 14px;
          font-weight: 500;
        }

        .hero-badge i {
          color: #ffd700;
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          background: linear-gradient(45deg, #ffd700, #a855f7, #3b82f6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 30px;
          animation: gradientShift 3s ease-in-out infinite;
          letter-spacing: -2px;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .hero-subtitle {
          font-size: 1.5rem;
          color: #cbd5e1;
          margin-bottom: 40px;
          font-weight: 300;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          align-items: center;
        }

        .btn-primary-futuristic {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          border: none;
          color: #000;
          font-weight: 700;
          padding: 15px 30px;
          border-radius: 50px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-primary-futuristic:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
          color: #000;
        }

        .btn-secondary-futuristic {
          background: transparent;
          border: 2px solid #a855f7;
          color: #a855f7;
          font-weight: 700;
          padding: 15px 30px;
          border-radius: 50px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-secondary-futuristic:hover {
          background: #a855f7;
          color: #fff;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(168, 85, 247, 0.4);
        }        .futuristic-card {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .main-card {
          animation: slideUp 0.8s ease-out;
        }        .user-welcome-section {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(168, 85, 247, 0.1));
          border: none;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
        }

        .user-avatar-container {
          margin-right: 20px;
        }

        .user-avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 3px solid #ffd700;
          object-fit: cover;
        }

        .user-avatar-fallback {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.5rem;
        }

        .user-welcome-text {
          color: #ffd700;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .profile-link {
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .profile-link:hover {
          color: #ffd700;
        }

        .stats-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stats-card:hover {
          transform: translateY(-5px) scale(1.02);
        }        .stats-card-primary {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.1));
          border: none;
        }

        .stats-card-primary:hover {
          box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
        }        .stats-card-secondary {
          background: linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1));
          border: none;
        }

        .stats-card-secondary:hover {
          box-shadow: 0 20px 40px rgba(168, 85, 247, 0.2);
        }

        .stats-icon-container {
          background: rgba(255, 255, 255, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .stats-card-primary .stats-icon {
          color: #ffd700;
          font-size: 1.5rem;
        }

        .stats-card-secondary .stats-icon {
          color: #a855f7;
          font-size: 1.5rem;
        }

        .stats-number {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .stats-card-primary .stats-number {
          color: #ffd700;
        }

        .stats-card-secondary .stats-number {
          color: #a855f7;
        }

        .stats-label {
          color: #cbd5e1;
          font-weight: 600;
          margin: 0;
        }

        .counter-animation {
          animation: countUp 0.6s ease-out;
        }

        @keyframes countUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .loading-dots {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }        .guest-welcome-section {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(168, 85, 247, 0.1));
          border: none;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
        }

        .guest-icon {
          color: #3b82f6;
          font-size: 2rem;
        }

        .guest-title {
          color: #3b82f6;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .guest-subtitle {
          color: #cbd5e1;
          margin: 0;
        }

        .description-section {
          margin: 60px 0;
        }

        .description-text {
          font-size: 1.2rem;
          color: #cbd5e1;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto;
        }

        .feature-card {
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:hover {
          transform: translateY(-10px) scale(1.02);
        }        .feature-card-upload {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.1));
          border: none;
        }

        .feature-card-upload:hover {
          box-shadow: 0 25px 50px rgba(255, 215, 0, 0.2);
        }        .feature-card-generate {
          background: linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1));
          border: none;
        }

        .feature-card-generate:hover {
          box-shadow: 0 25px 50px rgba(168, 85, 247, 0.2);
        }        .feature-card-analytics {
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1));
          border: none;
        }

        .feature-card-analytics:hover {
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.2);
        }

        .feature-icon-container {
          background: rgba(255, 255, 255, 0.1);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon-container {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .feature-icon {
          font-size: 2rem;
        }

        .feature-card-upload .feature-icon {
          color: #ffd700;
        }

        .feature-card-generate .feature-icon {
          color: #a855f7;
        }

        .feature-card-analytics .feature-icon {
          color: #3b82f6;
        }

        .feature-title {
          color: #fff;
          font-weight: 700;
          margin-bottom: 20px;
          font-size: 1.1rem;
          letter-spacing: 1px;
        }

        .feature-description {
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 30px;
        }

        .feature-actions {
          margin-top: auto;
        }

        .btn-feature-upload {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          border: none;
          color: #000;
          font-weight: 700;
          border-radius: 50px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-feature-upload:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
          color: #000;
        }

        .btn-feature-generate {
          background: linear-gradient(45deg, #a855f7, #9333ea);
          border: none;
          color: #fff;
          font-weight: 700;
          border-radius: 50px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-feature-generate:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
          color: #fff;
        }

        .btn-feature-analytics {
          background: linear-gradient(45deg, #3b82f6, #2563eb);
          border: none;
          color: #fff;
          font-weight: 700;
          border-radius: 50px;
          padding: 12px 24px;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-feature-analytics:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
          color: #fff;
        }

        .feature-note {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .recent-analyses-card {
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        .recent-analyses-header {
          background: rgba(0, 0, 0, 0.6);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px 20px 0 0;
          padding: 20px 30px;
        }

        .recent-analyses-header h5 {
          color: #fff;
        }

        .recent-analyses-icon-container {
          background: linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(168, 85, 247, 0.2));
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffd700;
        }

        .recent-analyses-list {
          padding: 0;
        }

        .recent-analysis-item {
          padding: 25px 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.6s ease-out both;
        }

        .recent-analysis-item:last-child {
          border-bottom: none;
        }

        .recent-analysis-item:hover {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), rgba(168, 85, 247, 0.05));
        }

        .analysis-icon {
          color: #ffd700;
        }

        .analysis-name {
          color: #fff;
          font-weight: 600;
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }

        .recent-analysis-item:hover .analysis-name {
          color: #ffd700;
        }

        .analysis-date {
          color: #94a3b8;
          margin: 0;
        }

        .analysis-badge {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .btn-view-analysis {
          background: transparent;
          border: 1px solid rgba(255, 215, 0, 0.5);
          color: #ffd700;
          padding: 8px 20px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-view-analysis:hover {
          background: #ffd700;
          color: #000;
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-buttons {
            flex-direction: column;
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .user-welcome-section .d-flex {
            flex-direction: column;
            text-align: center;
          }
          
          .user-avatar-container {
            margin-right: 0;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default Home;
