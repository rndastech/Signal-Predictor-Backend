import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { signalAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"

const Results = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [xValue, setXValue] = useState("")
  const [evaluationResult, setEvaluationResult] = useState(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [renameError, setRenameError] = useState("")

  useEffect(() => {
    // Get analysis data from navigation state or redirect to upload
    if (location.state) {
      setAnalysisResult(location.state.analysisResult)
      setAnalysis(location.state.analysis)
      // Debug log to see the data structure
      console.log("Analysis Result:", location.state.analysisResult)
      console.log("Analysis:", location.state.analysis)
    } else {
      navigate("/upload")
    }
  }, [location.state, navigate])
  const handleEvaluate = async (e) => {
    e.preventDefault()
    if (!xValue.trim()) return

    setLoading(true)
    setError("")

    try {
      // Parse the first valid number from the input
      const xValues = xValue
        .split(",")
        .map((x) => Number.parseFloat(x.trim()))
        .filter((x) => !isNaN(x))
      
      if (xValues.length === 0) {
        setError("Please enter a valid number")
        return
      }

      // Use the first value and pass analysis ID if available
      const response = await signalAPI.evaluateFunction(xValues[0], analysis?.id)
      setEvaluationResult(response.data)
    } catch (error) {
      setError(error.response?.data?.error || "Failed to evaluate function")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAnalysis = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    try {
      await signalAPI.saveSessionAnalysis()
      // Refresh to show saved analysis
      window.location.reload()
    } catch (error) {
      setError("Failed to save analysis")
    }
  }
  const handleRename = async () => {
    if (!newName.trim()) return;
    console.log('Renaming analysis', analysis.id, 'to', newName);
    try {
      const response = await signalAPI.updateAnalysis(analysis.id, { name: newName });
      console.log('Rename response:', response.data);
      setAnalysis(response.data);
      setShowRenameModal(false);
      setRenameError("");
    } catch (err) {
      console.error('Rename error:', err);
      // Display server-provided error or error message
      const message = err.response?.data?.error || err.message || "Failed to rename analysis";
      setRenameError(message);
    }
  }

  if (!analysisResult) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ paddingTop: "120px", background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)" }}
      >
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light fs-5">Loading analysis results...</p>
        </div>
      </div>
    )
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
          <div className="col-12 col-xl-11">            {/* Header Card */}
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="card-header border-0 bg-transparent py-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                  <div>
                    <h1
                      className="mb-2 text-light d-flex align-items-center gap-3"
                      style={{ fontSize: "2.5rem", fontWeight: "700" }}
                    >
                      <i
                        className="fas fa-chart-line"
                        style={{
                          color: "#ffc107",
                          textShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
                        }}
                      ></i>
                      ANALYSIS RESULTS
                    </h1>
                    {analysis && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                        <small className="text-muted fs-6">({analysis.display_name})</small>
                        <span
                          className="badge px-3 py-2"
                          style={{
                            background: "linear-gradient(45deg, #28a745, #20c997)",
                            borderRadius: "25px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          <i className="fas fa-check me-1"></i> AUTO-SAVED
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    {analysis && isAuthenticated ? (                      <button
                        className="btn px-4 py-2"
                        style={{
                          background: "transparent",
                          border: "2px solid #007bff",
                          borderRadius: "25px",
                          color: "#007bff",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                        }}                        onClick={() => {
                          setNewName(analysis.name || analysis.display_name)
                          setShowRenameModal(true)
                        }}onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.4)"
                          e.target.style.textShadow = "0 0 10px rgba(0, 123, 255, 0.6)"
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)"
                          e.target.style.boxShadow = "none"
                          e.target.style.textShadow = "none"
                        }}
                        onFocus={(e) => {
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.4)"
                          e.target.style.textShadow = "0 0 10px rgba(0, 123, 255, 0.6)"
                        }}
                        onBlur={(e) => {
                          e.target.style.transform = "translateY(0)"
                          e.target.style.boxShadow = "none"
                          e.target.style.textShadow = "none"
                        }}
                      >
                        <i className="fas fa-edit me-2"></i> RENAME
                      </button>
                    ) : (
                      isAuthenticated && (                        <button
                          className="btn px-4 py-2"
                          style={{
                            background: "transparent",
                            border: "2px solid #28a745",
                            borderRadius: "25px",
                            color: "#28a745",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onClick={handleSaveAnalysis}
                          onMouseOver={(e) => {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 8px 25px rgba(40, 167, 69, 0.4)"
                            e.target.style.textShadow = "0 0 10px rgba(40, 167, 69, 0.6)"
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "none"
                            e.target.style.textShadow = "none"
                          }}
                          onFocus={(e) => {
                            e.target.style.transform = "translateY(-2px)"
                            e.target.style.boxShadow = "0 8px 25px rgba(40, 167, 69, 0.4)"
                            e.target.style.textShadow = "0 0 10px rgba(40, 167, 69, 0.6)"
                          }}
                          onBlur={(e) => {
                            e.target.style.transform = "translateY(0)"
                            e.target.style.boxShadow = "none"
                            e.target.style.textShadow = "none"
                          }}
                        >
                          <i className="fas fa-save me-2"></i> SAVE
                        </button>
                      )
                    )}                    <Link
                      to="/upload"
                      className="btn px-4 py-2 text-decoration-none"
                      style={{
                        background: "transparent",
                        border: "2px solid #6f42c1",
                        borderRadius: "25px",
                        color: "#6f42c1",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)"
                        e.target.style.boxShadow = "0 8px 25px rgba(111, 66, 193, 0.4)"
                        e.target.style.textShadow = "0 0 10px rgba(111, 66, 193, 0.6)"
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                        e.target.style.textShadow = "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.transform = "translateY(-2px)"
                        e.target.style.boxShadow = "0 8px 25px rgba(111, 66, 193, 0.4)"
                        e.target.style.textShadow = "0 0 10px rgba(111, 66, 193, 0.6)"
                      }}
                      onBlur={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                        e.target.style.textShadow = "none"
                      }}
                    >
                      <i className="fas fa-upload me-2"></i> NEW ANALYSIS
                    </Link>
                  </div>
                </div>
              </div>
            </div>            {/* Fitted Function Card */}
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="card-body p-4">
                <h3 className="text-light mb-4 d-flex align-items-center gap-3">
                  <i className="fas fa-function" style={{ color: "#007bff" }}></i>
                  FITTED FUNCTION
                </h3>
                <div
                  className="p-4 rounded-3"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "2px solid rgba(255, 193, 7, 0.3)",
                    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <code
                    className="fs-5 fw-bold"
                    style={{
                      color: "#ffc107",
                      textShadow: "0 0 10px rgba(255, 193, 7, 0.3)",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  >
                    {analysisResult.fitted_function}
                  </code>
                </div>
              </div>
            </div>

            {/* Parameters and Frequencies Row */}
            <div className="row g-4 mb-4">
              {/* Model Parameters */}
              <div className="col-lg-6">
                <div
                  className="card h-100"                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)"
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.2)"
                    e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.3)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                    e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div className="card-body p-4">
                    <h4 className="text-light mb-4 d-flex align-items-center gap-3">
                      <i className="fas fa-cog" style={{ color: "#ffc107" }}></i>
                      MODEL PARAMETERS
                    </h4>
                    {analysisResult.parameters?.sinusoidal_components &&
                    Array.isArray(analysisResult.parameters.sinusoidal_components) &&
                    analysisResult.parameters.sinusoidal_components.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {analysisResult.parameters.sinusoidal_components.map((comp, index) => (                          <div
                            key={`comp-${index}`}
                            className="p-3 rounded-3"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%)",
                              border: "1px solid rgba(0, 123, 255, 0.2)",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)"
                              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.3)"
                              e.currentTarget.style.border = "1px solid rgba(0, 123, 255, 0.5)"
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "translateY(0)"
                              e.currentTarget.style.boxShadow = "none"
                              e.currentTarget.style.border = "1px solid rgba(0, 123, 255, 0.2)"
                            }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span
                                className="badge px-2 py-1"
                                style={{
                                  background: "linear-gradient(45deg, #007bff, #0056b3)",
                                  borderRadius: "15px",
                                  fontSize: "0.7rem",
                                }}
                              >
                                Component {index + 1}
                              </span>
                            </div>
                            <div className="row g-2 text-light">
                              <div className="col-4">
                                <small className="text-muted d-block">Amplitude</small>
                                <span className="fw-bold">
                                  {comp.amplitude !== undefined ? comp.amplitude.toFixed(4) : "N/A"}
                                </span>
                              </div>
                              <div className="col-4">
                                <small className="text-muted d-block">Frequency</small>
                                <span className="fw-bold">
                                  {comp.frequency !== undefined ? comp.frequency.toFixed(4) : "N/A"}
                                </span>
                              </div>
                              <div className="col-4">
                                <small className="text-muted d-block">Phase</small>
                                <span className="fw-bold">
                                  {comp.phase !== undefined ? comp.phase.toFixed(4) : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {analysisResult.parameters.offset !== undefined && (
                          <div
                            className="p-3 rounded-3"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)",
                              border: "1px solid rgba(40, 167, 69, 0.2)",
                            }}
                          >
                            <div className="text-light">
                              <small className="text-muted d-block">Offset</small>
                              <span className="fw-bold fs-5">{analysisResult.parameters.offset.toFixed(4)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="p-4 rounded-3 text-center"
                        style={{
                          background: "rgba(108, 117, 125, 0.1)",
                          border: "1px solid rgba(108, 117, 125, 0.2)",
                        }}
                      >
                        <i className="fas fa-info-circle text-muted mb-2 fs-4"></i>
                        <p className="text-muted mb-2">No model parameters available</p>
                        <small className="text-muted">Debug: {JSON.stringify(analysisResult.parameters)}</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>              {/* Dominant Frequencies */}
              <div className="col-lg-6">
                <div
                  className="card h-100"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)"
                    e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                    e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                    e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div className="card-body p-4">
                    <h4 className="text-light mb-4 d-flex align-items-center gap-3">
                      <i className="fas fa-wave-square" style={{ color: "#17a2b8" }}></i>
                      DOMINANT FREQUENCIES
                    </h4>
                    {analysisResult.dominant_frequencies &&
                    Array.isArray(analysisResult.dominant_frequencies) &&
                    analysisResult.dominant_frequencies.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {analysisResult.dominant_frequencies.map((freq, index) => (                          <div
                            key={`freq-${index}`}
                            className="p-3 rounded-3"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)",
                              border: "1px solid rgba(23, 162, 184, 0.2)",
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = "translateY(-2px)"
                              e.currentTarget.style.boxShadow = "0 8px 25px rgba(23, 162, 184, 0.3)"
                              e.currentTarget.style.border = "1px solid rgba(23, 162, 184, 0.5)"
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = "translateY(0)"
                              e.currentTarget.style.boxShadow = "none"
                              e.currentTarget.style.border = "1px solid rgba(23, 162, 184, 0.2)"
                            }}
                          >
                            <div className="row g-2 text-light">
                              <div className="col-6">
                                <small className="text-muted d-block">Frequency</small>
                                <span className="fw-bold">
                                  {Array.isArray(freq) && freq[0] !== undefined ? freq[0].toFixed(4) : "N/A"} Hz
                                </span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Amplitude</small>
                                <span className="fw-bold">
                                  {Array.isArray(freq) && freq[1] !== undefined ? freq[1].toFixed(4) : "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="p-4 rounded-3 text-center"
                        style={{
                          background: "rgba(108, 117, 125, 0.1)",
                          border: "1px solid rgba(108, 117, 125, 0.2)",
                        }}
                      >
                        <i className="fas fa-info-circle text-muted mb-2 fs-4"></i>
                        <p className="text-muted mb-2">No dominant frequencies detected</p>
                        <small className="text-muted">
                          Debug: {JSON.stringify(analysisResult.dominant_frequencies)}
                        </small>
                      </div>
                    )}

                    {analysisResult.mse !== undefined && analysisResult.mse !== null && (
                      <div className="mt-4">
                        <h5 className="text-light mb-3 d-flex align-items-center gap-2">
                          <i className="fas fa-chart-bar" style={{ color: "#28a745" }}></i>
                          Model Quality
                        </h5>
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)",
                            border: "1px solid rgba(40, 167, 69, 0.2)",
                          }}
                        >
                          <div className="text-light">
                            <small className="text-muted d-block">Mean Squared Error</small>
                            <span className="fw-bold fs-5">{analysisResult.mse.toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>            {/* Function Evaluation Card */}
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
              }}
            >
              <div className="card-body p-4">
                <h4 className="text-light mb-4 d-flex align-items-center gap-3">
                  <i className="fas fa-calculator" style={{ color: "#ffc107" }}></i>
                  EVALUATE FUNCTION
                </h4>
                <form onSubmit={handleEvaluate} className="row g-3 align-items-end">
                  <div className="col-md-8">                    <label className="form-label text-light mb-2">X Value</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter an x value (e.g., 1.5)"
                      value={xValue}
                      onChange={(e) => setXValue(e.target.value)}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "15px",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    />
                  </div>
                  <div className="col-md-4">                    <button
                      type="submit"
                      className="btn btn-lg w-100"
                      disabled={loading || !xValue.trim()}
                      style={{
                        background: "transparent",
                        border: loading ? "2px solid rgba(108, 117, 125, 0.5)" : "2px solid #ffc107",
                        borderRadius: "15px",
                        color: loading ? "rgba(108, 117, 125, 0.5)" : "#ffc107",
                        fontWeight: "700",
                        transition: "all 0.3s ease",
                      }}
                      onMouseOver={(e) => {
                        if (!loading && xValue.trim()) {
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 25px rgba(255, 193, 7, 0.4)"
                          e.target.style.textShadow = "0 0 10px rgba(255, 193, 7, 0.6)"
                        }
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                        e.target.style.textShadow = "none"
                      }}
                      onFocus={(e) => {
                        if (!loading && xValue.trim()) {
                          e.target.style.transform = "translateY(-2px)"
                          e.target.style.boxShadow = "0 8px 25px rgba(255, 193, 7, 0.4)"
                          e.target.style.textShadow = "0 0 10px rgba(255, 193, 7, 0.6)"
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "none"
                        e.target.style.textShadow = "none"
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play me-2"></i>
                          Evaluate
                        </>
                      )}
                    </button>
                  </div>
                </form>                {evaluationResult && (
                  <div
                    className="mt-4 p-4 rounded-3"
                    style={{
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "2px solid rgba(40, 167, 69, 0.3)",
                    }}
                  >
                    <h6 className="text-light mb-3 d-flex align-items-center gap-2">
                      <i className="fas fa-check-circle text-success"></i>
                      Evaluation Result
                    </h6>
                    <div className="p-3 rounded" style={{ background: "rgba(40, 167, 69, 0.1)" }}>
                      <code className="text-success fs-5">
                        f({evaluationResult.x_values[0]}) = {evaluationResult.y_values[0]?.toFixed(6)}
                      </code>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    className="alert mt-4 p-3 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      color: "#f8d7da",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}
              </div>
            </div>            {/* Visualizations */}
            {analysisResult.plots && (
              <div
                className="card mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                  e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                  e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div className="card-body p-4">
                  <h4 className="text-light mb-4 d-flex align-items-center gap-3">
                    <i className="fas fa-chart-area" style={{ color: "#6f42c1" }}></i>
                    VISUALIZATIONS
                  </h4>
                  <div className="row g-4">
                    {analysisResult.plots.frequency_spectrum && (
                      <div className="col-lg-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <h6 className="text-light mb-3">Frequency Spectrum</h6>
                          <img
                            src={`data:image/png;base64,${analysisResult.plots.frequency_spectrum}`}
                            alt="Frequency Spectrum"
                            className="img-fluid rounded-3"
                            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
                          />
                        </div>
                      </div>
                    )}
                    {analysisResult.plots.original_vs_reconstructed && (
                      <div className="col-lg-6">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <h6 className="text-light mb-3">Original vs Reconstructed Signal</h6>
                          <img
                            src={`data:image/png;base64,${analysisResult.plots.original_vs_reconstructed}`}
                            alt="Original vs Reconstructed"
                            className="img-fluid rounded-3"
                            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
                          />
                        </div>
                      </div>
                    )}
                    {analysisResult.plots.training_vs_testing && (
                      <div className="col-12">
                        <div
                          className="p-3 rounded-3"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                          }}
                        >
                          <h6 className="text-light mb-3">Training vs Testing Performance</h6>
                          <img
                            src={`data:image/png;base64,${analysisResult.plots.training_vs_testing}`}
                            alt="Training vs Testing"
                            className="img-fluid rounded-3"
                            style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}            {/* Data Preview */}
            {analysisResult.csv_data && analysisResult.csv_data.length > 0 && (
              <div
                className="card mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)"
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                  e.currentTarget.style.border = "1px solid rgba(255, 193, 7, 0.5)"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.3)"
                  e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div className="card-body p-4">
                  <h4 className="text-light mb-4 d-flex align-items-center gap-3">
                    <i className="fas fa-table" style={{ color: "#17a2b8" }}></i>
                    DATA PREVIEW
                    <span
                      className="badge ms-2 px-2 py-1"
                      style={{
                        background: "rgba(23, 162, 184, 0.2)",
                        color: "#17a2b8",
                        borderRadius: "15px",
                        fontSize: "0.7rem",
                      }}
                    >
                      First 10 rows
                    </span>
                  </h4>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover">
                      <thead>
                        <tr style={{ borderBottom: "2px solid rgba(23, 162, 184, 0.3)" }}>
                          <th className="py-3 px-4" style={{ background: "rgba(23, 162, 184, 0.1)" }}>
                            X
                          </th>
                          <th className="py-3 px-4" style={{ background: "rgba(23, 162, 184, 0.1)" }}>
                            Y
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.csv_data.slice(0, 10).map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <td className="py-2 px-4 font-monospace">{row.x.toFixed(3)}</td>
                            <td className="py-2 px-4 font-monospace">{row.y.toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div
              className="modal-content"
              style={{
                background: "rgba(33, 37, 41, 0.95)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-light d-flex align-items-center gap-2">
                  <i className="fas fa-edit text-primary"></i>
                  Rename Analysis
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowRenameModal(false)}
                  style={{ filter: "invert(1)" }}
                />
              </div>
              <div className="modal-body pt-2">
                <div className="mb-3">
                  <label className="form-label text-light">Analysis Name</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "15px",
                      color: "white",
                    }}
                    placeholder="Enter new name..."
                  />
                </div>
                {renameError && (
                  <div
                    className="alert p-3 rounded-3"
                    style={{
                      background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                      border: "1px solid rgba(220, 53, 69, 0.3)",
                      color: "#f8d7da",
                    }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {renameError}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={() => setShowRenameModal(false)}
                  style={{
                    background: "rgba(108, 117, 125, 0.2)",
                    border: "1px solid rgba(108, 117, 125, 0.3)",
                    borderRadius: "15px",
                    color: "#adb5bd",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={handleRename}
                  style={{
                    background: "transparent",
                    border: "2px solid #007bff",
                    borderRadius: "15px",
                    color: "#007bff",
                    fontWeight: "600",
                  }}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Results;
