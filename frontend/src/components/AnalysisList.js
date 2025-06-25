import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Link } from "react-router-dom"
import { signalAPI } from "../services/api"

const AnalysisList = () => {
  const { isAuthenticated } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfig, setDeleteConfig] = useState({
    type: '', // 'single' or 'bulk'
    id: null,
    title: '',
    message: '',
    count: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const fetchAnalyses = async () => {
      try {
        const response = await signalAPI.getAnalyses()
        setAnalyses(response.data)
      } catch (err) {
        console.error("Error loading analyses:", err)
        setError("Failed to load analyses")
      } finally {
        setLoading(false)
      }
    }
    fetchAnalyses()
  }, [isAuthenticated])

  // Toggle individual selection
  const handleToggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  // Select/Deselect all
  const handleSelectAll = () => {
    if (selectedIds.length === analyses.length) setSelectedIds([])
    else setSelectedIds(analyses.map((a) => a.id))
  }
  // Bulk delete selected
  const handleBulkDelete = async () => {
    setDeleteConfig({
      type: 'bulk',
      id: null,
      title: 'Delete Multiple Analyses',
      message: `Are you sure you want to delete ${selectedIds.length} selected analyses? This action cannot be undone.`,
      count: selectedIds.length
    })
    setShowDeleteModal(true)
  }
  // Single delete
  const handleDelete = async (id) => {
    const analysis = analyses.find(a => a.id === id)
    const analysisName = analysis?.display_name || `Analysis #${id}`
    setDeleteConfig({
      type: 'single',
      id: id,
      title: 'Delete Analysis',
      message: `Are you sure you want to delete "${analysisName}"? This action cannot be undone.`,
      count: 1
    })
    setShowDeleteModal(true)
  }

  // Confirm delete action
  const confirmDelete = async () => {
    if (deleteConfig.type === 'bulk') {
      setBulkDeleting(true)
      try {
        await signalAPI.bulkDeleteAnalyses(selectedIds)
        setAnalyses((prev) => prev.filter((a) => !selectedIds.includes(a.id)))
        setSelectedIds([])
      } catch {
        setError("Failed to bulk delete analyses")
      } finally {
        setBulkDeleting(false)
      }
    } else if (deleteConfig.type === 'single') {
      try {
        await signalAPI.deleteAnalysis(deleteConfig.id)
        setAnalyses((prev) => prev.filter((a) => a.id !== deleteConfig.id))
        setSelectedIds((prev) => prev.filter((x) => x !== deleteConfig.id))
      } catch {
        setError("Failed to delete analysis")
      }
    }
    setShowDeleteModal(false)
  }

  if (!isAuthenticated) {
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
            <div className="col-lg-6 col-xl-5">
              <div
                className="card text-center"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "25px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="card-body p-5">
                  <div
                    className="mb-4"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)",
                      borderRadius: "50%",
                      width: "100px",
                      height: "100px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      border: "2px solid rgba(255, 193, 7, 0.2)",
                    }}
                  >
                    <i
                      className="fas fa-lock"
                      style={{
                        fontSize: "2.5rem",
                        color: "#ffc107",
                        textShadow: "0 0 20px rgba(255, 193, 7, 0.5)",
                      }}
                    ></i>
                  </div>
                  <h2 className="text-light mb-3" style={{ fontWeight: "700" }}>
                    ACCESS RESTRICTED
                  </h2>
                  <p className="text-muted mb-4 fs-5">Please log in to view your signal analyses.</p>
                  <a
                    href="/login"
                    className="btn btn-lg px-5 py-3"
                    style={{
                      background: "transparent",
                      border: "2px solid #ffc107",
                      borderRadius: "25px",
                      color: "#ffc107",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
                    onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    LOGIN
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light fs-5">Loading analyses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          paddingTop: "80px",
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
        }}
      >
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div
                className="alert p-4 rounded-3"
                style={{
                  background: "linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)",
                  border: "1px solid rgba(220, 53, 69, 0.3)",
                  color: "#f8d7da",
                }}
              >
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
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
          <div className="col-12">
            {/* Header Card */}
            <div
              className="card mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
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
                        className="fas fa-list"
                        style={{
                          color: "#17a2b8",
                          textShadow: "0 0 20px rgba(23, 162, 184, 0.5)",
                        }}
                      ></i>
                      SIGNAL ANALYSES
                    </h1>
                    <div className="d-flex align-items-center gap-3">
                      <span
                        className="badge px-3 py-2"
                        style={{
                          background: "linear-gradient(45deg, #17a2b8, #138496)",
                          borderRadius: "25px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                        }}
                      >
                        {analyses.length} Total Analyses
                      </span>
                      {selectedIds.length > 0 && (
                        <span
                          className="badge px-3 py-2"
                          style={{
                            background: "linear-gradient(45deg, #ffc107, #e0a800)",
                            borderRadius: "25px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: "#000",
                          }}
                        >
                          {selectedIds.length} Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn px-4 py-2"
                      disabled={!selectedIds.length || bulkDeleting}
                      onClick={handleBulkDelete}
                      style={{
                        background: "transparent",
                        border: bulkDeleting ? "2px solid rgba(220, 53, 69, 0.3)" : "2px solid #dc3545",
                        borderRadius: "25px",
                        color: bulkDeleting ? "rgba(220, 53, 69, 0.5)" : "#dc3545",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        opacity: !selectedIds.length ? 0.5 : 1,
                      }}
                    >
                      {bulkDeleting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash me-2"></i>
                          DELETE SELECTED ({selectedIds.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div
              className="card"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="card-body p-4">
                {/* Select All Control */}
                <div className="mb-4">
                  <div
                    className="form-check p-3 rounded-3"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <input
                      className="form-check-input me-3"
                      type="checkbox"
                      id="selectAll"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === analyses.length && analyses.length > 0}
                      style={{
                        width: "1.2rem",
                        height: "1.2rem",
                        backgroundColor: "transparent",
                        borderColor: "#17a2b8",
                      }}
                    />
                    <label htmlFor="selectAll" className="form-check-label text-light fw-bold fs-5">
                      <i className="fas fa-check-double me-2" style={{ color: "#17a2b8" }}></i>
                      SELECT ALL ANALYSES
                    </label>
                  </div>
                </div>

                {/* Analysis Table */}
                {analyses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle">
                      <thead>
                        <tr
                          style={{
                            borderBottom: "2px solid rgba(23, 162, 184, 0.3)",
                            background: "rgba(23, 162, 184, 0.05)",
                          }}
                        >
                          <th scope="col" className="py-3 px-4" style={{ width: "50px" }}>
                            <i className="fas fa-check" style={{ color: "#17a2b8" }}></i>
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-tag me-2" style={{ color: "#ffc107" }}></i>
                            Name
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-calendar me-2" style={{ color: "#28a745" }}></i>
                            Created
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-function me-2" style={{ color: "#007bff" }}></i>
                            Fitted Function
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-chart-bar me-2" style={{ color: "#6f42c1" }}></i>
                            MSE
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-wave-square me-2" style={{ color: "#17a2b8" }}></i>
                            Components
                          </th>
                          <th scope="col" className="py-3 px-4">
                            <i className="fas fa-cogs me-2" style={{ color: "#fd7e14" }}></i>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyses.map((a) => (
                          <tr
                            key={a.id}
                            style={{
                              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                              transition: "all 0.3s ease",
                              background: selectedIds.includes(a.id) ? "rgba(23, 162, 184, 0.1)" : "transparent",
                            }}
                          >
                            <td className="py-3 px-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(a.id)}
                                onChange={() => handleToggle(a.id)}
                                style={{
                                  width: "1.1rem",
                                  height: "1.1rem",
                                  backgroundColor: "transparent",
                                  borderColor: "#17a2b8",
                                }}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <div className="fw-bold text-light fs-6">{a.display_name || `Analysis #${a.id}`}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-muted small">{new Date(a.created_at).toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                className="p-2 rounded font-monospace small"
                                style={{
                                  background: "rgba(0, 0, 0, 0.3)",
                                  border: "1px solid rgba(255, 193, 7, 0.2)",
                                  color: "#ffc107",
                                  maxWidth: "250px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {a.fitted_function?.slice(0, 35) + "…" || "N/A"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="badge px-2 py-1"
                                style={{
                                  background: "linear-gradient(45deg, #28a745, #20c997)",
                                  borderRadius: "15px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {a.mse?.toFixed(6) || "N/A"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="badge px-2 py-1"
                                style={{
                                  background: "linear-gradient(45deg, #007bff, #0056b3)",
                                  borderRadius: "15px",
                                  fontSize: "0.75rem",
                                }}
                              >
                                {a.parameters?.sinusoidal_components?.length || 0} components
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/analysis/${a.id}`}
                                  className="btn btn-sm px-3 py-2"
                                  style={{
                                    background: "transparent",
                                    border: "1px solid #17a2b8",
                                    borderRadius: "15px",
                                    color: "#17a2b8",
                                    fontWeight: "600",
                                    fontSize: "0.75rem",
                                    transition: "all 0.3s ease",
                                    textDecoration: "none",
                                  }}
                                  onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
                                  onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                                >
                                  <i className="fas fa-eye me-1"></i> VIEW
                                </Link>
                                <button
                                  className="btn btn-sm px-3 py-2"
                                  onClick={() => handleDelete(a.id)}
                                  style={{
                                    background: "transparent",
                                    border: "1px solid #dc3545",
                                    borderRadius: "15px",
                                    color: "#dc3545",
                                    fontWeight: "600",
                                    fontSize: "0.75rem",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
                                  onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                                >
                                  <i className="fas fa-trash me-1"></i> DELETE
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    className="text-center py-5"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "15px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <div
                      className="mb-4"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(108, 117, 125, 0.1) 0%, rgba(108, 117, 125, 0.05) 100%)",
                        borderRadius: "50%",
                        width: "80px",
                        height: "80px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto",
                        border: "2px solid rgba(108, 117, 125, 0.2)",
                      }}
                    >
                      <i className="fas fa-chart-line" style={{ fontSize: "2rem", color: "#6c757d" }}></i>
                    </div>
                    <h4 className="text-light mb-3">No Analyses Found</h4>
                    <p className="text-muted mb-4">You haven't created any signal analyses yet.</p>
                    <Link
                      to="/upload"
                      className="btn btn-lg px-5 py-3"
                      style={{
                        background: "transparent",
                        border: "2px solid #17a2b8",
                        borderRadius: "25px",
                        color: "#17a2b8",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        textDecoration: "none",
                      }}
                      onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
                      onMouseOut={(e) => (e.target.style.transform = "translateY(0)")}
                    >
                      <i className="fas fa-plus me-2"></i>
                      CREATE YOUR FIRST ANALYSIS
                    </Link>
                  </div>
                )}
              </div>            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(5px)",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div
              className="modal-content"
              style={{
                background: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(220, 53, 69, 0.3)",
                borderRadius: "20px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="modal-header border-0 pb-0">
                <h5
                  className="modal-title text-light d-flex align-items-center gap-3"
                  style={{ fontSize: "1.5rem", fontWeight: "700" }}
                >
                  <i
                    className="fas fa-exclamation-triangle"
                    style={{
                      color: "#dc3545",
                      textShadow: "0 0 20px rgba(220, 53, 69, 0.5)",
                    }}
                  ></i>
                  {deleteConfig.title}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    filter: "invert(1)",
                    opacity: 0.7,
                  }}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-light fs-6 mb-0">
                  {deleteConfig.message}
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn px-4 py-2 me-2"
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    background: "transparent",
                    border: "2px solid #6c757d",
                    borderRadius: "15px",
                    color: "#6c757d",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  CANCEL
                </button>
                <button
                  type="button"
                  className="btn px-4 py-2"
                  onClick={confirmDelete}
                  disabled={bulkDeleting}
                  style={{
                    background: "linear-gradient(45deg, #dc3545, #c82333)",
                    border: "none",
                    borderRadius: "15px",
                    color: "white",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    opacity: bulkDeleting ? 0.7 : 1,
                  }}
                >
                  {bulkDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      DELETING...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-2"></i>
                      DELETE {deleteConfig.type === 'bulk' ? `(${deleteConfig.count})` : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisList
