import { useEffect, useState, useRef } from "react";
import { api } from "../../api";
import NearbyHospitals from "../../components/NearbyHospitals";
import "./Analysis.css";

const ANALYSIS_CATEGORIES = [
  {
    id: "BLOOD_REPORT",
    name: "Blood Report Analysis (UCI Coimbra ML Model)",
    category: "BLOOD_REPORT",
    analysisType: "BLOOD_REPORT",
    accept: ".pdf",
    badge: "Machine Learning (RF)",
    desc: "Evaluates 9 metabolic & inflammatory biomarkers (Glucose, Insulin, HOMA-IR, Adipokines) against the UCI Breast Cancer Coimbra model.",
  },
  {
    id: "PET_CT_REPORT",
    name: "PET / CT Report Analysis (Structured Clinical NLP)",
    category: "PET_CT_REPORT",
    analysisType: "RADIOLOGY_REPORT",
    accept: ".pdf",
    badge: "Clinical NLP & Deauville",
    desc: "Extracts Deauville criteria, evaluates nodal/extranodal findings, and handles clinical negations ('No fresh disease', 'No abnormal uptake').",
  },
  {
    id: "SONOGRAPHY_REPORT",
    name: "Sonography Report Document (Clinical NLP)",
    category: "SONOGRAPHY_REPORT",
    analysisType: "RADIOLOGY_REPORT",
    accept: ".pdf",
    badge: "Clinical NLP",
    desc: "Evaluates radiologist impressions, BI-RADS criteria, and tissue architecture with negation context detection.",
  },
  {
    id: "SONOGRAPHY_IMAGE",
    name: "Sonography / Ultrasound Image (BUSI ResNet-18)",
    category: "SONOGRAPHY_IMAGE",
    analysisType: "MEDICAL_IMAGE",
    accept: "image/*",
    badge: "Deep Learning ResNet-18",
    desc: "ResNet-18 model trained specifically on breast ultrasound imaging (normal, benign, malignant).",
  },
  {
    id: "PET_CT_IMAGE",
    name: "PET / CT Scan Image (Volumetric 3D Model)",
    category: "PET_CT_IMAGE",
    analysisType: "MEDICAL_IMAGE",
    accept: "image/*",
    badge: "PET-CT Imaging",
    desc: "Requires matched volumetric FDG-PET/CT model. Ultrasound models are not applied to PET/CT scans.",
  },
];

const COIMBRA_FIELDS = [
  { key: "Age", label: "Age", unit: "years", min: 1, max: 120, placeholder: "e.g. 45" },
  { key: "BMI", label: "BMI", unit: "kg/m²", min: 10, max: 80, placeholder: "e.g. 23.5" },
  { key: "Glucose", label: "Glucose", unit: "mg/dL", min: 20, max: 600, placeholder: "e.g. 92" },
  { key: "Insulin", label: "Insulin", unit: "µU/mL", min: 0, max: 800, placeholder: "e.g. 6.8" },
  { key: "HOMA", label: "HOMA-IR", unit: "", min: 0, max: 100, placeholder: "e.g. 1.55" },
  { key: "Leptin", label: "Leptin", unit: "ng/mL", min: 0, max: 400, placeholder: "e.g. 18.2" },
  { key: "Adiponectin", label: "Adiponectin", unit: "µg/mL", min: 0, max: 300, placeholder: "e.g. 10.5" },
  { key: "Resistin", label: "Resistin", unit: "ng/mL", min: 0, max: 300, placeholder: "e.g. 14.7" },
  { key: "MCP.1", label: "MCP-1", unit: "pg/dL", min: 0, max: 5000, placeholder: "e.g. 450" },
];

export default function Analysis() {
  const [selectedType, setSelectedType] = useState(ANALYSIS_CATEGORIES[0].id);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Patient clinical vitals
  const [vitals, setVitals] = useState({
    bloodPressure: "120/80",
    oxygenLevel: "98",
    temperature: "98.6",
    sugarLevel: "95",
    cholesterol: "180",
    symptoms: "",
  });

  // Biomarkers for Coimbra model
  const [biomarkers, setBiomarkers] = useState({
    Age: "45",
    BMI: "24.2",
    Glucose: "92",
    Insulin: "5.6",
    HOMA: "1.27",
    Leptin: "15.4",
    Adiponectin: "11.2",
    Resistin: "12.8",
    "MCP.1": "412",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [activeResult, setActiveResult] = useState(null);
  const fileInputRef = useRef(null);

  const currentOption = ANALYSIS_CATEGORIES.find((c) => c.id === selectedType) || ANALYSIS_CATEGORIES[0];

  const fetchPredictions = async () => {
    try {
      const data = await api("/api/predictions");
      if (Array.isArray(data)) {
        setPredictions(data);
        if (data.length > 0 && !activeResult) {
          const completed = data.find((d) => d.status === "COMPLETED") || data[0];
          setActiveResult(completed);
        }
      }
    } catch (err) {
      console.warn("Could not fetch predictions:", err);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");

    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

  const handleBiomarkerChange = (e) => {
    const { name, value } = e.target;
    setBiomarkers((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a report PDF or medical scan image.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file to GridFS
      const formData = new FormData();
      formData.append("category", currentOption.category);
      formData.append("file", file);

      const uploadedRecord = await api("/api/files", {
        method: "POST",
        body: formData,
      });

      if (!uploadedRecord || !uploadedRecord.id) {
        throw new Error("File upload failed. Please try again.");
      }

      // 2. Prepare payload for prediction
      const payloadMeasurements = {
        ...vitals,
      };

      if (currentOption.analysisType === "BLOOD_REPORT") {
        for (const [k, v] of Object.entries(biomarkers)) {
          payloadMeasurements[k] = Number(v) || v;
        }
      }

      // 3. Request ML/DL prediction
      const predRes = await api("/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          analysisType: currentOption.analysisType,
          sourceFileId: uploadedRecord.id,
          measurements: payloadMeasurements,
        }),
      });

      setSuccess("Your document was stored in MongoDB GridFS, and analyzed by the clinical prediction engine.");
      setActiveResult(predRes);
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh history list
      await fetchPredictions();

      // Scroll to result
      setTimeout(() => {
        document.getElementById("prediction-result-view")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const isUnavailable = activeResult && (activeResult.status === "ANALYSIS_UNAVAILABLE" || activeResult.status === "FAILED");
  const findings = activeResult?.findings || {};
  const hasConfidence = activeResult?.confidence !== null && activeResult?.confidence !== undefined;

  return (
    <div className="analysis-page-container">
      <div className="analysis-header-banner">
        <span className="analysis-subtitle">CLINICAL ML & MULTI-MODAL REASONING</span>
        <h1>Early Disease Detection & Report Analysis</h1>
        <p>
          Upload blood reports, PET/CT scans, or ultrasound documentation. Real machine learning models and context-aware clinical NLP analyze parameters without naive keyword matching or hallucinated probabilities.
        </p>
      </div>

      <div className="analysis-main-grid">
        {/* Left Side: Upload & Input Form */}
        <div className="analysis-form-card">
          <div className="card-top-header">
            <h2>Analysis Request</h2>
            <span className="badge-secure">🔒 GridFS Storage</span>
          </div>

          {error && <div className="analysis-alert error-alert">{error}</div>}
          {success && <div className="analysis-alert success-alert">{success}</div>}

          <form onSubmit={handleSubmit} className="prediction-form">
            {/* 1. Select Analysis Modality */}
            <div className="form-group-custom">
              <label className="input-label">Select Analysis Modality</label>
              <div className="analysis-type-selector">
                {ANALYSIS_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    className={`type-select-btn ${selectedType === cat.id ? "active" : ""}`}
                    onClick={() => {
                      setSelectedType(cat.id);
                      setFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <div className="type-btn-header">
                      <span className="type-btn-title">{cat.name}</span>
                      <span className="type-btn-badge">{cat.badge}</span>
                    </div>
                    <p className="type-btn-desc">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. File Upload Box */}
            <div className="form-group-custom">
              <label className="input-label">
                Upload {currentOption.analysisType === "MEDICAL_IMAGE" ? "Medical Scan Image" : "Report PDF"}
              </label>
              <div className="file-dropzone">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="medical-file-input"
                  accept={currentOption.accept}
                  onChange={handleFileChange}
                  className="file-input-hidden"
                  required
                />
                <label htmlFor="medical-file-input" className="file-dropzone-label">
                  <div className="dropzone-icon">📁</div>
                  <div className="dropzone-text">
                    <strong>{file ? file.name : "Click or browse to upload file"}</strong>
                    <span>
                      Supported: {currentOption.accept === ".pdf" ? "PDF Documents (Reports)" : "PNG, JPG, DICOM, WEBP"}
                    </span>
                  </div>
                  {file && <span className="file-size-tag">{(file.size / 1024).toFixed(1)} KB</span>}
                </label>
              </div>

              {previewUrl && (
                <div className="image-preview-wrapper">
                  <span className="preview-tag">Image Preview</span>
                  <img src={previewUrl} alt="Scan preview" className="scan-preview-img" />
                </div>
              )}
            </div>

            {/* 3. Patient Vitals */}
            <div className="form-group-custom">
              <label className="input-label">Patient Vitals & Clinical Observation</label>
              <div className="vitals-inputs-grid">
                <div className="vital-item">
                  <label>Blood Pressure</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    placeholder="120/80"
                    value={vitals.bloodPressure}
                    onChange={handleVitalChange}
                  />
                </div>
                <div className="vital-item">
                  <label>Oxygen SpO2 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="oxygenLevel"
                    placeholder="98"
                    value={vitals.oxygenLevel}
                    onChange={handleVitalChange}
                  />
                </div>
                <div className="vital-item">
                  <label>Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={handleVitalChange}
                  />
                </div>
                <div className="vital-item">
                  <label>Sugar Level (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="sugarLevel"
                    placeholder="95"
                    value={vitals.sugarLevel}
                    onChange={handleVitalChange}
                  />
                </div>
                <div className="vital-item">
                  <label>Cholesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="cholesterol"
                    placeholder="180"
                    value={vitals.cholesterol}
                    onChange={handleVitalChange}
                  />
                </div>
              </div>

              <div className="symptoms-item">
                <label>Clinical Notes / Symptoms (Optional context)</label>
                <textarea
                  name="symptoms"
                  rows="2"
                  placeholder="e.g. Post-chemotherapy follow-up, routine staging assessment, asymptomatic"
                  value={vitals.symptoms}
                  onChange={handleVitalChange}
                />
              </div>
            </div>

            {/* 4. If Blood Report: Coimbra Biomarkers */}
            {currentOption.analysisType === "BLOOD_REPORT" && (
              <div className="form-group-custom biomarkers-section">
                <div className="section-title-row">
                  <label className="input-label">Blood Report Biomarkers (Coimbra Clinical Profile)</label>
                  <small>Units match UCI Breast Cancer Coimbra dataset</small>
                </div>
                <div className="biomarkers-grid">
                  {COIMBRA_FIELDS.map((f) => (
                    <div className="biomarker-field" key={f.key}>
                      <span className="bio-label">
                        {f.label} {f.unit ? `(${f.unit})` : ""}
                      </span>
                      <input
                        type="number"
                        step="any"
                        name={f.key}
                        value={biomarkers[f.key] ?? ""}
                        placeholder={f.placeholder}
                        onChange={handleBiomarkerChange}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="submit-analysis-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-icon"></span>
                  Processing with Model...
                </>
              ) : (
                <>🔬 Run Model Analysis</>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Prediction Result & Nearby Hospitals */}
        <div className="analysis-result-column" id="prediction-result-view">
          {activeResult ? (
            <div className={`active-result-card ${isUnavailable ? "status-card-unavailable" : ""}`}>
              <div className="result-header">
                <div>
                  <span className="result-tag">
                    {isUnavailable ? "STATUS NOTICE" : "MODEL EVALUATION REPORT"}
                  </span>
                  <h3>{activeResult.analysisType?.replace(/_/g, " ")}</h3>
                  {activeResult.modelName && (
                    <span className="model-identifier-tag">Model: {activeResult.modelName}</span>
                  )}
                </div>
                <span className={`status-pill ${activeResult.status?.toLowerCase()}`}>
                  {activeResult.status}
                </span>
              </div>

              <div className="result-body">
                <div className={`findings-box ${isUnavailable ? "findings-unavailable" : ""}`}>
                  <span className="findings-title">
                    {isUnavailable ? "Notice & System Message" : "Clinical Findings & Assessment"}
                  </span>
                  <p className="findings-text">{activeResult.result}</p>
                </div>

                {/* Structured Findings (e.g. for PET-CT and Radiology Reports) */}
                {findings && Object.keys(findings).length > 0 && (
                  <div className="structured-findings-container">
                    <span className="structured-title">Structured Extracted Parameters</span>

                    {findings.deauville_score !== null && findings.deauville_score !== undefined && (
                      <div className="finding-row-item">
                        <span className="finding-key">Deauville Score:</span>
                        <span className={`deauville-badge deauville-${findings.deauville_score}`}>
                          Score {findings.deauville_score} (Lugano 5-point scale)
                        </span>
                      </div>
                    )}

                    {findings.negated_findings && findings.negated_findings.length > 0 && (
                      <div className="finding-block-item">
                        <span className="finding-subheading">Negated / Absent Findings (Context-Verified):</span>
                        <div className="tags-flex">
                          {findings.negated_findings.map((nf, idx) => (
                            <span className="tag-negated" key={idx}>✓ {nf}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {findings.positive_findings && findings.positive_findings.length > 0 && (
                      <div className="finding-block-item">
                        <span className="finding-subheading">Active / Detected Findings:</span>
                        <div className="tags-flex">
                          {findings.positive_findings.map((pf, idx) => (
                            <span className="tag-positive" key={idx}>⚠️ {pf}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {findings.benign_findings && findings.benign_findings.length > 0 && (
                      <div className="finding-block-item">
                        <span className="finding-subheading">Physiologic / Stable Observations:</span>
                        <div className="tags-flex">
                          {findings.benign_findings.map((bf, idx) => (
                            <span className="tag-benign" key={idx}>ℹ️ {bf}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Metrics Row - Only displayed when actual model confidence is present */}
                {!isUnavailable && (
                  <div className="metrics-row">
                    <div className="metric-card">
                      <span className="metric-label">Model Confidence</span>
                      <strong className="metric-value">
                        {hasConfidence ? `${(activeResult.confidence * 100).toFixed(1)}%` : "N/A"}
                      </strong>
                      {hasConfidence && (
                        <div className="confidence-meter">
                          <div
                            className="confidence-fill"
                            style={{
                              width: `${(activeResult.confidence * 100).toFixed(0)}%`,
                              backgroundColor:
                                activeResult.urgency === "LOW_RISK"
                                  ? "#1e8449"
                                  : activeResult.confidence > 0.7
                                  ? "#980202"
                                  : "#e67e22",
                            }}
                          ></div>
                        </div>
                      )}
                      <span className="metric-hint">
                        {hasConfidence ? "Derived from verified model signal" : "Not applicable"}
                      </span>
                    </div>

                    <div className="metric-card">
                      <span className="metric-label">Urgency Assessment</span>
                      <strong
                        className={`urgency-status-badge ${
                          activeResult.urgency === "CLINICIAN_REVIEW" || activeResult.urgency === "HIGH"
                            ? "badge-urgent"
                            : activeResult.urgency === "LOW_RISK"
                            ? "badge-normal"
                            : "badge-unknown"
                        }`}
                      >
                        {activeResult.urgency === "CLINICIAN_REVIEW"
                          ? "🚨 Clinician Review Needed"
                          : activeResult.urgency === "LOW_RISK"
                          ? "🟢 Low Risk / Complete Response"
                          : activeResult.urgency || "Unknown"}
                      </strong>
                      <span className="metric-hint">Based on findings verification</span>
                    </div>
                  </div>
                )}

                <div className="disclaimer-note">
                  ℹ️ <strong>Decision Support Notice:</strong> CureEarly is an early warning decision support tool. It does not replace pathology, biopsy, or a registered oncologist / radiologist evaluation.
                </div>
              </div>

              {/* HOSPITAL RECOMMENDATION BASED ON USER LOCATION & URGENCY */}
              {!isUnavailable && (
                <NearbyHospitals urgency={activeResult.urgency || "LOW_RISK"} />
              )}
            </div>
          ) : (
            <div className="result-placeholder-card">
              <div className="placeholder-icon">🔬</div>
              <h3>No Analysis Run Yet</h3>
              <p>
                Select a modality, attach a medical image or report, and click <strong>Run Model Analysis</strong>. The prediction and nearest hospital suggestions will display here in real-time.
              </p>
            </div>
          )}

          {/* Past Analyses Table */}
          {predictions.length > 0 && (
            <div className="history-card">
              <h3>Previous Analysis History</h3>
              <div className="history-list">
                {predictions.map((p) => (
                  <div
                    key={p.id}
                    className={`history-item ${activeResult?.id === p.id ? "active-item" : ""}`}
                    onClick={() => setActiveResult(p)}
                  >
                    <div className="history-meta">
                      <strong>{p.analysisType?.replace(/_/g, " ")}</strong>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="history-status">
                      <span className={`pill-small ${p.status?.toLowerCase()}`}>{p.status}</span>
                      <span className="view-link">View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
