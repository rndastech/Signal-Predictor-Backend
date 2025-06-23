import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { generatorAPI } from '../services/api';

const GeneratorResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create and trigger download of CSV data client-side
  const downloadCsv = () => {
    if (!result?.csv_data) return;
    const rows = ['x,y'];
    result.csv_data.forEach(({ x, y }) => rows.push(`${x},${y}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_signal.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (location.state?.resultData) {
      setResult(location.state.resultData);
    } else {
      navigate('/signal-generator');
    }
  }, [location.state, navigate]);
  if (!result) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ paddingTop: "120px", background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)" }}
      >
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light fs-5">Loading generated signal...</p>
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
          <div className="col-12 col-xl-11">
            {/* Header Card */}
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
                          color: "#28a745",
                          textShadow: "0 0 20px rgba(40, 167, 69, 0.5)",
                        }}
                      ></i>
                      GENERATED SIGNAL
                    </h1>
                    <p className="mb-0 text-muted fs-6">
                      Synthetic sinusoidal signal with {result.parameters.sinusoids.length} component(s)
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn px-4 py-2"
                      style={{
                        background: "transparent",
                        border: "2px solid #28a745",
                        borderRadius: "25px",
                        color: "#28a745",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      onClick={downloadCsv}
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
                    >
                      <i className="fas fa-download me-2"></i> DOWNLOAD CSV
                    </button>
                    <Link
                      to="/signal-generator"
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
                    >
                      <i className="fas fa-magic me-2"></i> GENERATE NEW
                    </Link>
                  </div>
                </div>
              </div>
            </div>            {/* Generated Function Card */}
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
                  GENERATED FUNCTION
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
                    {result.function_string}
                  </code>
                </div>
              </div>
            </div>            {/* Parameters and Components Row */}
            <div className="row g-4 mb-4">
              {/* Generation Parameters */}
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
                      GENERATION PARAMETERS
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%)",
                          border: "1px solid rgba(0, 123, 255, 0.2)",
                        }}
                      >
                        <div className="row g-2 text-light">
                          <div className="col-6">
                            <small className="text-muted d-block">X Range</small>
                            <span className="fw-bold">{result.parameters.x_range[0]} to {result.parameters.x_range[1]}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Data Points</small>
                            <span className="fw-bold">{result.parameters.num_points}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)",
                          border: "1px solid rgba(40, 167, 69, 0.2)",
                        }}
                      >
                        <div className="row g-2 text-light">
                          <div className="col-6">
                            <small className="text-muted d-block">DC Offset</small>
                            <span className="fw-bold">{result.parameters.offset}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Noise Level</small>
                            <span className="fw-bold">{result.parameters.noise_level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sinusoidal Components */}
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
                      SINUSOIDAL COMPONENTS
                    </h4>
                    <div className="d-flex flex-column gap-3">
                      {result.parameters.sinusoids.map((s, idx) => (
                        <div
                          key={`sinusoid-${idx}-${s[0]}-${s[1]}`}
                          className="p-3 rounded-3"
                          style={{
                            background: "linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)",
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
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span
                              className="badge px-2 py-1"
                              style={{
                                background: "linear-gradient(45deg, #17a2b8, #138496)",
                                borderRadius: "15px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Component {idx + 1}
                            </span>
                          </div>
                          <div className="row g-2 text-light">
                            <div className="col-4">
                              <small className="text-muted d-block">Amplitude</small>
                              <span className="fw-bold">{s[0].toFixed(3)}</span>
                            </div>
                            <div className="col-4">
                              <small className="text-muted d-block">Frequency</small>
                              <span className="fw-bold">{s[1].toFixed(3)}</span>
                            </div>
                            <div className="col-4">
                              <small className="text-muted d-block">Phase</small>
                              <span className="fw-bold">{s[2].toFixed(3)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Visualizations */}
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
                  SIGNAL VISUALIZATION
                </h4>                <div className="row g-4">
                  <div className="col-lg-6">
                    <div
                      className="p-3 rounded-3"
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <h6 className="text-light mb-3">Generated Signal</h6>
                      <img
                        src={`data:image/png;base64,${result.plots.signal}`}
                        alt="Generated Signal"
                        className="img-fluid rounded-3"
                        style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
                      />
                    </div>
                  </div>
                  {result.plots.components && (
                    <div className="col-lg-6">
                      <div
                        className="p-3 rounded-3"
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <h6 className="text-light mb-3">Individual Sinusoidal Components</h6>
                        <img
                          src={`data:image/png;base64,${result.plots.components}`}
                          alt="Signal Components"
                          className="img-fluid rounded-3"
                          style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>            {/* Data Preview */}
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
                    First 10 of {result.parameters.num_points} points
                  </span>
                </h4>
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr style={{ borderBottom: "2px solid rgba(23, 162, 184, 0.3)" }}>
                        <th className="py-3 px-4" style={{ background: "rgba(23, 162, 184, 0.1)" }}>
                          #
                        </th>
                        <th className="py-3 px-4" style={{ background: "rgba(23, 162, 184, 0.1)" }}>
                          X
                        </th>
                        <th className="py-3 px-4" style={{ background: "rgba(23, 162, 184, 0.1)" }}>
                          Y
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.csv_data.slice(0, 10).map((row, idx) => (
                        <tr
                          key={`data-row-${idx}-${row.x}`}
                          style={{
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <td className="py-2 px-4 font-monospace">{idx + 1}</td>
                          <td className="py-2 px-4 font-monospace">{row.x.toFixed(4)}</td>
                          <td className="py-2 px-4 font-monospace">{row.y.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>            {/* Next Steps Actions */}
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
                  <i className="fas fa-tools" style={{ color: "#ffc107" }}></i>
                  NEXT STEPS
                </h4>
                <div className="row g-4">
                  <div className="col-md-4">
                    <div
                      className="card h-100"
                      style={{
                        background: "linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)",
                        border: "2px solid rgba(40, 167, 69, 0.3)",
                        borderRadius: "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-10px)"
                        e.currentTarget.style.boxShadow = "0 15px 40px rgba(40, 167, 69, 0.4)"
                        e.currentTarget.style.border = "2px solid rgba(40, 167, 69, 0.6)"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.border = "2px solid rgba(40, 167, 69, 0.3)"
                      }}
                    >
                      <div className="card-body text-center p-4">
                        <i
                          className="fas fa-download fa-3x mb-3"
                          style={{ color: "#28a745", textShadow: "0 0 20px rgba(40, 167, 69, 0.5)" }}
                        ></i>
                        <h6 className="text-light mb-2">Download CSV</h6>
                        <p className="small text-muted mb-3">Save the generated signal data for external use</p>
                        <button
                          className="btn btn-outline-success"
                          onClick={downloadCsv}
                          style={{
                            borderRadius: "15px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#28a745"
                            e.target.style.color = "white"
                            e.target.style.textShadow = "0 0 10px rgba(40, 167, 69, 0.8)"
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "transparent"
                            e.target.style.color = "#28a745"
                            e.target.style.textShadow = "none"
                          }}
                        >
                          <i className="fas fa-download me-2"></i> Download
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div
                      className="card h-100"
                      style={{
                        background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                        border: "2px solid rgba(255, 193, 7, 0.3)",
                        borderRadius: "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-10px)"
                        e.currentTarget.style.boxShadow = "0 15px 40px rgba(255, 193, 7, 0.4)"
                        e.currentTarget.style.border = "2px solid rgba(255, 193, 7, 0.6)"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.border = "2px solid rgba(255, 193, 7, 0.3)"
                      }}
                    >
                      <div className="card-body text-center p-4">
                        <i
                          className="fas fa-chart-line fa-3x mb-3"
                          style={{ color: "#ffc107", textShadow: "0 0 20px rgba(255, 193, 7, 0.5)" }}
                        ></i>
                        <h6 className="text-light mb-2">Analyze Signal</h6>
                        <p className="small text-muted mb-3">Test the predictor with this generated data</p>
                        <Link
                          to="/upload"
                          className="btn btn-outline-warning text-decoration-none"
                          style={{
                            borderRadius: "15px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#ffc107"
                            e.target.style.color = "black"
                            e.target.style.textShadow = "0 0 10px rgba(255, 193, 7, 0.8)"
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "transparent"
                            e.target.style.color = "#ffc107"
                            e.target.style.textShadow = "none"
                          }}
                        >
                          <i className="fas fa-upload me-2"></i> Analyze
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div
                      className="card h-100"
                      style={{
                        background: "linear-gradient(135deg, rgba(111, 66, 193, 0.1) 0%, rgba(111, 66, 193, 0.05) 100%)",
                        border: "2px solid rgba(111, 66, 193, 0.3)",
                        borderRadius: "20px",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-10px)"
                        e.currentTarget.style.boxShadow = "0 15px 40px rgba(111, 66, 193, 0.4)"
                        e.currentTarget.style.border = "2px solid rgba(111, 66, 193, 0.6)"
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "none"
                        e.currentTarget.style.border = "2px solid rgba(111, 66, 193, 0.3)"
                      }}
                    >
                      <div className="card-body text-center p-4">
                        <i
                          className="fas fa-magic fa-3x mb-3"
                          style={{ color: "#6f42c1", textShadow: "0 0 20px rgba(111, 66, 193, 0.5)" }}
                        ></i>
                        <h6 className="text-light mb-2">Generate Again</h6>
                        <p className="small text-muted mb-3">Create a new synthetic signal with different parameters</p>
                        <Link
                          to="/signal-generator"
                          className="btn btn-outline-info text-decoration-none"
                          style={{
                            borderColor: "#6f42c1",
                            color: "#6f42c1",
                            borderRadius: "15px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#6f42c1"
                            e.target.style.color = "white"
                            e.target.style.textShadow = "0 0 10px rgba(111, 66, 193, 0.8)"
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "transparent"
                            e.target.style.color = "#6f42c1"
                            e.target.style.textShadow = "none"
                          }}
                        >
                          <i className="fas fa-redo me-2"></i> Generate
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratorResults;
