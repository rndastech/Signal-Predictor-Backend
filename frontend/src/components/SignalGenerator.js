import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generatorAPI } from '../services/api'

const SignalGenerator = () => {
  const navigate = useNavigate()
  const [xStart, setXStart] = useState(0)
  const [xEnd, setXEnd] = useState(50)
  const [numPoints, setNumPoints] = useState(1000)
  const [offset, setOffset] = useState(0)
  const [numSinusoids, setNumSinusoids] = useState(3)
  const [addNoise, setAddNoise] = useState(false)
  const [noiseLevel, setNoiseLevel] = useState(0.1)
  const [useRandomParams, setUseRandomParams] = useState(false)
  const [amplitude1, setAmplitude1] = useState(1.0)
  const [frequency1, setFrequency1] = useState(0.1)
  const [phase1, setPhase1] = useState(0)
  const [amplitude2, setAmplitude2] = useState(0.5)
  const [frequency2, setFrequency2] = useState(0.2)
  const [phase2, setPhase2] = useState(0)
  const [amplitude3, setAmplitude3] = useState(0.3)
  const [frequency3, setFrequency3] = useState(0.05)
  const [phase3, setPhase3] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const params = {
        x_start: xStart,
        x_end: xEnd,
        num_points: numPoints,
        offset,
        num_sinusoids: numSinusoids,
        add_noise: addNoise,
        noise_level: addNoise ? noiseLevel : 0,
        use_random_parameters: useRandomParams,
        amplitude_1: amplitude1,
        frequency_1: frequency1,
        phase_1: phase1,
        amplitude_2: amplitude2,
        frequency_2: frequency2,
        phase_2: phase2,
        amplitude_3: amplitude3,
        frequency_3: frequency3,
        phase_3: phase3,
      }
      console.log('Sending generator params:', params);
      const response = await generatorAPI.generateSignal(params)
      const data = response.data
      console.log('Received generator response:', data);
      if (data.success) {
        navigate('/generator-results', { state: { resultData: data } })
      } else if (data.error) {
        setError(data.error)
      } else {
        setError('Generation failed: ' + JSON.stringify(data))
      }
    } catch (err) {
      console.error('Generator API error:', err);
      const resp = err.response?.data
      if (resp) {
        if (resp.error) setError(resp.error)
        else setError(JSON.stringify(resp))
      } else {
        setError('Failed to generate signal')
      }
    } finally {
      setLoading(false)
    }
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
          <div className="col-12 col-xl-10">
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
                <h1
                  className="mb-0 text-light text-center d-flex align-items-center justify-content-center gap-3"
                  style={{ fontSize: "2.5rem", fontWeight: "700" }}
                >
                  <i
                    className="fas fa-magic"
                    style={{
                      color: "#ffc107",
                      textShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
                    }}
                  ></i>
                  SIGNAL GENERATOR
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit}>              {/* General Parameters Card */}
              <div
                className="card mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
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
                    <i className="fas fa-cog" style={{ color: "#17a2b8" }}></i>
                    GENERAL PARAMETERS
                  </h4>
                  <div className="row g-4">
                    <div className="col-md-3">
                      <label htmlFor="xStart" className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        X Start
                      </label>
                      <input
                        id="xStart"
                        type="number"
                        className="form-control"
                        value={xStart}
                        step="0.1"
                        onChange={e => setXStart(parseFloat(e.target.value))}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="xEnd" className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        X End
                      </label>
                      <input
                        id="xEnd"
                        type="number"
                        className="form-control"
                        value={xEnd}
                        step="0.1"
                        onChange={e => setXEnd(parseFloat(e.target.value))}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="numPoints" className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        Number of Points
                      </label>
                      <input
                        id="numPoints"
                        type="number"
                        className="form-control"
                        value={numPoints}
                        min="1"
                        onChange={e => setNumPoints(parseInt(e.target.value) || 0)}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <label htmlFor="offset" className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        DC Offset
                      </label>
                      <input
                        id="offset"
                        type="number"
                        className="form-control"
                        value={offset}
                        step="0.1"
                        onChange={e => setOffset(parseFloat(e.target.value))}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>              {/* Sinusoid Count and Noise Card */}
              <div
                className="card mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
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
                    <i className="fas fa-wave-square" style={{ color: "#28a745" }}></i>
                    SIGNAL CONFIGURATION
                  </h4>
                  <div className="row g-4 align-items-end">
                    <div className="col-md-3">
                      <label htmlFor="numSinusoids" className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        Number of Sinusoids
                      </label>
                      <input
                        id="numSinusoids"
                        type="number"
                        className="form-control"
                        value={numSinusoids}
                        min="1"
                        max="10"
                        onChange={e => setNumSinusoids(parseInt(e.target.value) || 1)}
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "15px",
                          color: "white",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <div
                        className="p-3 rounded-3 h-100 d-flex align-items-center"
                        style={{
                          background: addNoise ? "rgba(40, 167, 69, 0.1)" : "rgba(108, 117, 125, 0.1)",
                          border: addNoise ? "1px solid rgba(40, 167, 69, 0.3)" : "1px solid rgba(108, 117, 125, 0.2)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="addNoise"
                            checked={addNoise}
                            onChange={e => setAddNoise(e.target.checked)}
                            style={{ transform: "scale(1.2)" }}
                          />
                          <label className="form-check-label text-light ms-3" htmlFor="addNoise" style={{ fontWeight: "600" }}>
                            <i className="fas fa-random me-2"></i>Add Noise
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-light mb-2" style={{ fontWeight: "600" }}>
                        Noise Level
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={noiseLevel}
                        step="0.01"
                        min="0"
                        disabled={!addNoise}
                        onChange={e => setNoiseLevel(parseFloat(e.target.value) || 0)}
                        style={{
                          background: addNoise ? "rgba(255, 255, 255, 0.1)" : "rgba(108, 117, 125, 0.1)",
                          border: addNoise ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(108, 117, 125, 0.2)",
                          borderRadius: "15px",
                          color: addNoise ? "white" : "rgba(108, 117, 125, 0.6)",
                          fontSize: "1rem",
                          padding: "12px 16px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>              {/* Parameter Generation Mode Card */}
              <div
                className="card mb-4"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
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
                  <div
                    className="p-4 rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      background: useRandomParams ? "rgba(111, 66, 193, 0.1)" : "rgba(108, 117, 125, 0.1)",
                      border: useRandomParams ? "1px solid rgba(111, 66, 193, 0.3)" : "1px solid rgba(108, 117, 125, 0.2)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="useRandomParams"
                        checked={useRandomParams}
                        onChange={e => setUseRandomParams(e.target.checked)}
                        style={{ transform: "scale(1.3)" }}
                      />
                      <label className="form-check-label text-light ms-3" htmlFor="useRandomParams" style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                        <i className="fas fa-dice me-2" style={{ color: "#6f42c1" }}></i>
                        Use Random Parameters
                      </label>
                    </div>
                  </div>
                </div>
              </div>              {/* Manual Parameters Card */}
              {!useRandomParams && (
                <div
                  className="card mb-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    transition: "all 0.3s ease",
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
                      <i className="fas fa-sliders-h" style={{ color: "#ffc107" }}></i>
                      MANUAL SINUSOID PARAMETERS
                    </h4>
                    <div className="row g-4">
                      {[1,2,3].map(i => {
                        // Determine values based on index
                        let amplitudeValue, frequencyValue, phaseValue, headerColor, gradientColor;
                        let setAmp, setFreq, setPh;
                        if (i === 1) {
                          amplitudeValue = amplitude1;
                          frequencyValue = frequency1;
                          phaseValue = phase1;
                          setAmp = v => setAmplitude1(v);
                          setFreq = v => setFrequency1(v);
                          setPh = v => setPhase1(v);
                          headerColor = '#007bff';
                          gradientColor = 'rgba(0, 123, 255, 0.1)';
                        } else if (i === 2) {
                          amplitudeValue = amplitude2;
                          frequencyValue = frequency2;
                          phaseValue = phase2;
                          setAmp = v => setAmplitude2(v);
                          setFreq = v => setFrequency2(v);
                          setPh = v => setPhase2(v);
                          headerColor = '#28a745';
                          gradientColor = 'rgba(40, 167, 69, 0.1)';
                        } else {
                          amplitudeValue = amplitude3;
                          frequencyValue = frequency3;
                          phaseValue = phase3;
                          setAmp = v => setAmplitude3(v);
                          setFreq = v => setFrequency3(v);
                          setPh = v => setPhase3(v);
                          headerColor = '#ffc107';
                          gradientColor = 'rgba(255, 193, 7, 0.1)';
                        }
                        return (
                          <div className="col-lg-4" key={i}>
                            <div
                              className="card h-100"
                              style={{
                                background: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(5px)",
                                border: `1px solid ${headerColor}30`,
                                borderRadius: "15px",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                                transition: "all 0.3s ease",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-3px)"
                                e.currentTarget.style.boxShadow = `0 8px 25px ${headerColor}40`
                                e.currentTarget.style.border = `1px solid ${headerColor}60`
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)"
                                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)"
                                e.currentTarget.style.border = `1px solid ${headerColor}30`
                              }}
                            >
                              <div
                                className="card-header border-0 text-center py-3"
                                style={{
                                  background: gradientColor,
                                  borderRadius: "15px 15px 0 0",
                                }}
                              >
                                <h6 className="mb-0 text-light" style={{ fontWeight: "700", color: headerColor }}>
                                  <i className="fas fa-sine-wave me-2" style={{ color: headerColor }}></i>
                                  SINUSOID {i}
                                </h6>
                              </div>
                              <div className="card-body p-3">
                                <div className="mb-3">
                                  <label htmlFor={`amplitude-${i}`} className="form-label text-light mb-2" style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                                    <i className="fas fa-arrows-alt-v me-1"></i>Amplitude
                                  </label>
                                  <input
                                    id={`amplitude-${i}`}
                                    type="number"
                                    className="form-control"
                                    step="0.1"
                                    value={amplitudeValue}
                                    onChange={e => setAmp(parseFloat(e.target.value) || 0)}
                                    style={{
                                      background: "rgba(255, 255, 255, 0.1)",
                                      border: "1px solid rgba(255, 255, 255, 0.2)",
                                      borderRadius: "10px",
                                      color: "white",
                                      fontSize: "0.95rem",
                                      padding: "10px 12px",
                                    }}
                                  />
                                </div>
                                <div className="mb-3">
                                  <label htmlFor={`frequency-${i}`} className="form-label text-light mb-2" style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                                    <i className="fas fa-wave-square me-1"></i>Frequency
                                  </label>
                                  <input
                                    id={`frequency-${i}`}
                                    type="number"
                                    className="form-control"
                                    step="0.01"
                                    value={frequencyValue}
                                    onChange={e => setFreq(parseFloat(e.target.value) || 0)}
                                    style={{
                                      background: "rgba(255, 255, 255, 0.1)",
                                      border: "1px solid rgba(255, 255, 255, 0.2)",
                                      borderRadius: "10px",
                                      color: "white",
                                      fontSize: "0.95rem",
                                      padding: "10px 12px",
                                    }}
                                  />
                                </div>
                                <div className="mb-0">
                                  <label htmlFor={`phase-${i}`} className="form-label text-light mb-2" style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                                    <i className="fas fa-sync-alt me-1"></i>Phase
                                  </label>
                                  <input
                                    id={`phase-${i}`}
                                    type="number"
                                    className="form-control"
                                    step="0.1"
                                    value={phaseValue}
                                    onChange={e => setPh(parseFloat(e.target.value) || 0)}
                                    style={{
                                      background: "rgba(255, 255, 255, 0.1)",
                                      border: "1px solid rgba(255, 255, 255, 0.2)",
                                      borderRadius: "10px",
                                      color: "white",
                                      fontSize: "0.95rem",
                                      padding: "10px 12px",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        background: "rgba(23, 162, 184, 0.1)",
                        border: "1px solid rgba(23, 162, 184, 0.3)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-info-circle" style={{ color: "#17a2b8" }}></i>
                        <span className="text-light" style={{ fontSize: "0.95rem" }}>
                          If you specify more than 3 sinusoids, additional components will be generated randomly.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}              {/* Error Message */}
              {error && (
                <div
                  className="card mb-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(220, 53, 69, 0.3)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(220, 53, 69, 0.2)",
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3">
                      <i className="fas fa-exclamation-triangle" style={{ color: "#dc3545", fontSize: "1.5rem" }}></i>
                      <span className="text-light" style={{ fontSize: "1.1rem" }}>{error}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button Card */}
              <div
                className="card"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  transition: "all 0.3s ease",
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
                <div className="card-body p-5 text-center">
                  <button
                    type="submit"
                    className="btn btn-lg px-5 py-3"
                    disabled={loading}
                    style={{
                      background: loading ? "rgba(108, 117, 125, 0.2)" : "transparent",
                      border: loading ? "2px solid rgba(108, 117, 125, 0.5)" : "2px solid #ffc107",
                      borderRadius: "25px",
                      color: loading ? "rgba(108, 117, 125, 0.7)" : "#ffc107",
                      fontWeight: "700",
                      fontSize: "1.2rem",
                      transition: "all 0.3s ease",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.transform = "translateY(-3px)"
                        e.target.style.boxShadow = "0 15px 35px rgba(255, 193, 7, 0.5)"
                        e.target.style.textShadow = "0 0 20px rgba(255, 193, 7, 0.8)"
                        e.target.style.background = "rgba(255, 193, 7, 0.1)"
                      }
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "none"
                      e.target.style.textShadow = "none"
                      e.target.style.background = "transparent"
                    }}
                    onFocus={(e) => {
                      if (!loading) {
                        e.target.style.transform = "translateY(-3px)"
                        e.target.style.boxShadow = "0 15px 35px rgba(255, 193, 7, 0.5)"
                        e.target.style.textShadow = "0 0 20px rgba(255, 193, 7, 0.8)"
                        e.target.style.background = "rgba(255, 193, 7, 0.1)"
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "none"
                      e.target.style.textShadow = "none"
                      e.target.style.background = "transparent"
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-3" role="status"></span>
                        Generating Signal...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic me-3" style={{ fontSize: "1.1rem" }}></i>
                        Generate Signal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignalGenerator
