import React, { useState } from "react";
import jsPDF from "jspdf";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Suggested questions for rapid testing
  const sampleQuestions = [
    "What are the primary findings visible in this chest X-ray?",
    "Are there any signs of pneumothorax or pleural effusion?",
    "What are the potential risk factors associated with these findings?",
  ];

  // =========================================================
  // IMAGE HANDLING
  // =========================================================

  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a JPG, JPEG or PNG image.");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleFileChange = (e) => {
    handleImage(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImage(file);
    }
  };

  // =========================================================
  // ANALYZE CASE
  // =========================================================

  const analyzeCase = async () => {
    if (!question.trim()) {
      alert("Please enter a clinical question.");
      return;
    }

    if (!image) {
      alert("Please upload a chest X-ray image.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("image", image);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.message || "Analysis failed");
      }

      setResult(data);
    } catch (error) {
      console.error(error);
      alert(
        "Could not connect to the Medical AI backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UTILITY FUNCTIONS
  // =========================================================

  const getFindingName = (finding, index) => {
    return (
      finding?.finding ||
      finding?.name ||
      finding?.label ||
      `Finding ${index + 1}`
    );
  };

  const getFindingScore = (finding) => {
    if (typeof finding?.score === "number") {
      return finding.score;
    }
    if (typeof finding?.confidence === "number") {
      return finding.confidence;
    }
    return 0;
  };

  const getSeverity = () => {
    const findings = result?.image_findings || [];

    if (!findings.length) {
      return {
        level: "No clear abnormality detected",
        description:
          "The image model did not identify a high-confidence finding. This does not rule out disease or other abnormalities. Clinical review should still be considered when symptoms or risk factors are present.",
        doctor: false,
      };
    }

    const scores = findings
      .map((finding) => getFindingScore(finding))
      .filter((score) => score > 0);

    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    const pneumothorax = findings.some((finding) => {
      const name = getFindingName(finding, 0).toLowerCase();
      return name.includes("pneumothorax") && getFindingScore(finding) >= 0.5;
    });

    if (pneumothorax || highestScore >= 0.8) {
      return {
        level: "Higher attention",
        description:
          "The image model identified a finding with relatively high model confidence. The result should be reviewed by a qualified healthcare professional, particularly if the patient has symptoms.",
        doctor: true,
      };
    }

    if (highestScore >= 0.6) {
      return {
        level: "Moderate attention",
        description:
          "The model identified a finding that may warrant further clinical review. A healthcare professional should interpret the finding together with symptoms, medical history and other investigations.",
        doctor: true,
      };
    }

    return {
      level: "Lower attention",
      description:
        "The detected findings have relatively lower model confidence. The result should not be considered a diagnosis, and clinical review remains appropriate when symptoms or risk factors are present.",
      doctor: false,
    };
  };

  // =========================================================
  // PDF GENERATION
  // =========================================================

  const generateClinicalPDF = () => {
    if (!result) {
      alert("Please analyze a case first.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const margin = 17;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const newPage = () => {
      doc.addPage();
      y = 20;
    };

    const ensureSpace = (height = 8) => {
      if (y + height > 275) {
        newPage();
      }
    };

    const wrappedText = (text, fontSize = 9, lineHeight = 4.8) => {
      if (!text) return;
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text), contentWidth);
      lines.forEach((line) => {
        ensureSpace(lineHeight);
        doc.text(line, margin, y);
        y += lineHeight;
      });
    };

    const heading = (text) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(text, margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
    };

    const footer = () => {
      const pages = doc.internal.getNumberOfPages();
      for (let page = 1; page <= pages; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(
          "Medical AI Copilot • AI-generated clinical research report",
          margin,
          289
        );
        doc.text(`Page ${page} of ${pages}`, pageWidth - margin, 289, {
          align: "right",
        });
      }
    };

    // Document Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Medical AI Copilot", margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Multi-Agent Clinical Intelligence", margin, y);
    y += 11;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Clinical Analysis Report", margin, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 10;

    heading("Clinical Question");
    wrappedText(question || "No clinical question provided.", 9, 4.8);
    y += 4;

    heading("Analysis Route");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      result.route ? String(result.route).toUpperCase() : "RESEARCH",
      margin,
      y
    );
    y += 9;

    heading("Clinical Summary");
    let answer = result.answer || "No clinical synthesis was generated.";
    if (answer.length > 2200) {
      answer = answer.substring(0, 2200).trim() + "...";
    }
    wrappedText(answer, 8.8, 4.6);
    y += 5;

    const findings = result.image_findings || [];
    if (findings.length > 0) {
      heading("X-Ray Findings");
      findings.slice(0, 5).forEach((finding, index) => {
        ensureSpace(12);
        const name = getFindingName(finding, index);
        const score = getFindingScore(finding);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${index + 1}. ${name}`, margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Model confidence: ${(score * 100).toFixed(1)}%`, margin + 5, y);
        y += 6;
      });
      y += 2;
    }

    const severity = getSeverity();
    heading("Clinical Attention Guidance");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`Attention level: ${severity.level}`, margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    wrappedText(severity.description, 8.5, 4.5);
    y += 3;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(
      severity.doctor
        ? "Professional review: Recommended"
        : "Professional review: Consider if symptoms or risk factors are present",
      margin,
      y
    );
    y += 8;

    // Page 2
    newPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Supporting Evidence & Safety", margin, y);
    y += 11;

    heading("Key Medical Evidence");
    const evidence = result.image_evidence || [];

    if (evidence.length > 0) {
      evidence.slice(0, 3).forEach((item, index) => {
        ensureSpace(15);
        const text = item?.text || item?.content || item?.answer || "";
        if (!text) return;

        let shortText = String(text);
        if (shortText.length > 450) {
          shortText = shortText.substring(0, 450).trim() + "...";
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`Evidence ${index + 1}`, margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        wrappedText(shortText, 8, 4.2);

        if (item.source) {
          y += 1;
          doc.setFontSize(7.5);
          const sourceStr = String(item.source).split("/").pop();
          doc.text(`Source: ${sourceStr}`, margin, y);
          y += 5;
        } else {
          y += 3;
        }
      });
    } else {
      wrappedText("No supporting medical evidence was returned.", 8.5, 4.5);
    }

    if (result.sources && result.sources.length > 0) {
      heading("Sources");
      result.sources.slice(0, 4).forEach((source, index) => {
        ensureSpace(8);
        wrappedText(`${index + 1}. ${source}`, 7.8, 4.2);
        y += 1;
      });
    }

    heading("Limitations");
    wrappedText(
      "The X-ray findings are AI model predictions and are not confirmed diagnoses. Model confidence scores should not be interpreted as disease probability or clinical severity. The retrieved medical evidence is limited to the sources available to this system.",
      8.2,
      4.3
    );
    y += 4;

    heading("Clinical Safety Note");
    wrappedText(
      "This report is intended to support medical research and information retrieval. It does not replace professional radiology interpretation, medical examination, diagnosis, treatment or clinical judgment. Concerning symptoms should be assessed by an appropriate healthcare professional.",
      8.2,
      4.3
    );

    footer();

    const safeQuestion = (question || "clinical_analysis")
      .replace(/[^a-z0-9]+/gi, "_")
      .substring(0, 50);

    doc.save(`Clinical_Analysis_${safeQuestion}.pdf`);
  };

  const clearCase = () => {
    setImage(null);
    setPreview(null);
    setQuestion("");
    setResult(null);
  };

  const severity = result ? getSeverity() : null;

  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">+</div>
          <div>
            <div className="brand-name">Medical AI Copilot</div>
            <div className="brand-subtitle">
              Multi-Agent Clinical Intelligence
            </div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="container">
        {/* HERO SECTION */}
        <section className="hero">
          <div className="eyebrow">MULTI-AGENT MEDICAL ANALYSIS</div>
          <h1>
            Clinical <span>AI Copilot</span>
          </h1>
          <p>
            Upload a chest X-ray and ask a clinical question to retrieve
            evidence and generate an AI-assisted analysis.
          </p>
        </section>

        {/* INPUT GRID SECTION */}
        <section className="input-grid">
          {/* QUESTION CARD */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Clinical Question</h2>
                <p>Formulate your query for the multi-agent pipeline</p>
              </div>
              <div className="help-icon">?</div>
            </div>

            <div className="question-form">
              <textarea
                className="question-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Example: What are the possible risk factors associated with the findings in this X-ray?"
              />

              <div className="suggestions">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* IMAGE UPLOAD CARD */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Chest X-Ray</h2>
                <p>Upload a clear DICOM export, PNG or JPEG scan</p>
              </div>
              <div className="card-icon">📷</div>
            </div>

            <div
              className={`upload-area ${dragging ? "dragging" : ""} ${
                preview ? "has-image" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Chest X-ray preview"
                    className="xray-preview"
                  />
                  <div className="image-overlay">
                    <span
                      className="change-image"
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                      }}
                    >
                      Change image
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="upload-symbol">+</div>
                  <div className="upload-title">Drag & drop X-ray here</div>
                  <div className="upload-description">or</div>
                  <label className="browse-button">
                    Browse image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  <div className="file-types">JPG, JPEG or PNG</div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ANALYZE BUTTON */}
        <button
          className="analyze-button"
          onClick={analyzeCase}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              <span>Analyzing Clinical Case...</span>
            </>
          ) : (
            <span>Analyze Clinical Case</span>
          )}
        </button>

        {/* AGENT PIPELINE STATUS */}
        <div className="pipeline">
          <div className="pipeline-label">AGENT PIPELINE FLOW</div>
          <div className="pipeline-items">
            <div className="pipeline-item">
              <span>01</span> Image Analysis Agent
            </div>
            <div className="pipeline-line"></div>
            <div className="pipeline-item">
              <span>02</span> RAG Evidence Retrieval
            </div>
            <div className="pipeline-line"></div>
            <div className="pipeline-item">
              <span>03</span> Clinical Synthesis Agent
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && !loading && (
          <section className="results">
            <div className="results-header">
              <h2>Clinical Analysis Results</h2>
              <span className="route-badge">
                Route: {result.route || "Research"}
              </span>
            </div>

            {/* AI SYNTHESIS CARD */}
            <div className="result-card">
              <div className="result-title">
                <span>✦</span> AI Clinical Synthesis
              </div>
              <div className="answer">
                {result.answer || "No synthesis available."}
              </div>
            </div>

            {/* X-RAY FINDINGS CARD */}
            {result.image_findings && result.image_findings.length > 0 && (
              <div className="result-card">
                <div className="result-title">
                  <span>◉</span> Identified X-Ray Findings
                </div>
                <div className="findings">
                  {result.image_findings.slice(0, 6).map((finding, index) => {
                    const score = getFindingScore(finding);
                    return (
                      <div className="finding" key={index}>
                        <div className="finding-name">
                          {getFindingName(finding, index)}
                        </div>
                        <div className="finding-score">
                          {(score * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RETRIEVED MEDICAL EVIDENCE */}
            {result.image_evidence && result.image_evidence.length > 0 && (
              <div className="result-card evidence-card">
                <div className="section-heading">
                  <div className="section-icon">◇</div>
                  <div>
                    <h2>Retrieved Medical Evidence</h2>
                    <p>Evidence fetched from knowledge databases</p>
                  </div>
                  <span className="evidence-badge">
                    {result.image_evidence.length} Sources Found
                  </span>
                </div>

                <div className="evidence-list">
                  {result.image_evidence.slice(0, 3).map((item, index) => {
                    const text =
                      item?.text || item?.content || item?.answer || "";
                    const shortText =
                      text.length > 280
                        ? text.substring(0, 280).trim() + "..."
                        : text;

                    return (
                      <div className="evidence-item" key={index}>
                        <div className="evidence-number">{index + 1}</div>
                        <div className="evidence-content">
                          <h3>Medical Evidence {index + 1}</h3>
                          <p>{shortText}</p>
                          {item?.source && (
                            <div className="evidence-source">
                              <span>Source:</span>
                              <span>
                                {String(item.source).split("/").pop()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SOURCES LIST */}
            {result.sources && result.sources.length > 0 && (
              <div className="result-card">
                <div className="result-title">
                  <span>◌</span> Sources
                </div>
                <div>
                  {result.sources.slice(0, 5).map((source, index) => (
                    <div className="source" key={index}>
                      <span>[{index + 1}]</span>
                      <div>{source}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CLINICAL DISCLAIMER */}
            <div className="disclaimer">
              <strong>Clinical Safety Note:</strong> {severity?.description}{" "}
              This output is generated by an AI research prototype and is not a
              substitute for professional clinical examination or diagnostic procedures.
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button
                className="analyze-button"
                onClick={generateClinicalPDF}
                style={{ flex: 1 }}
              >
                Download Clinical Report (PDF)
              </button>
              <button
                className="browse-button"
                onClick={clearCase}
                style={{ marginTop: 0 }}
              >
                Start New Analysis
              </button>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer>
        Medical AI Copilot • Multi-Agent Clinical Intelligence System
      </footer>
    </div>
  );
}

export default App;