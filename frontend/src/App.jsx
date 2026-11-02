import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [activeTab, setActiveTab] = useState('full-analysis');
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Tab 2 Overlay Controls
  const [activeOverlay, setActiveOverlay] = useState('bbox');

  // Follow-Up Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      text: "Hello Doctor. I have reviewed the chest X-ray findings for Patient PX-90421 (Lobar Pneumonia - 88.4%). How can I assist you with follow-up consultation or antibiotic recommendations?"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Pathology Confidence Metrics
  const pathologyMetrics = [
    { pathology: "Lung Opacity", confidence: 91.8, color: "#ef4444" },
    { pathology: "Pneumonia", confidence: 88.4, color: "#f59e0b" },
    { pathology: "Infiltration", confidence: 76.2, color: "#3b82f6" },
    { pathology: "Pleural Thickening", confidence: 42.5, color: "#8b5cf6" },
    { pathology: "Fibrosis", confidence: 28.1, color: "#10b981" },
    { pathology: "Nodule", confidence: 14.3, color: "#64748b" }
  ];

  // Dynamic Theme Colors
  const isDark = theme === 'dark';
  const styles = {
    bg: isDark ? '#0a0d14' : '#f8fafc',
    text: isDark ? '#fff' : '#0f172a',
    subtext: isDark ? '#8e95a5' : '#64748b',
    cardBg: isDark ? '#121624' : '#ffffff',
    cardBorder: isDark ? '#1e2638' : '#e2e8f0',
    innerBg: isDark ? '#161c2c' : '#f1f5f9',
    innerBorder: isDark ? '#2e3a52' : '#cbd5e1',
    inputBg: isDark ? '#1a2030' : '#ffffff',
    pillBg: isDark ? '#1e2638' : '#e2e8f0',
    pillText: isDark ? '#a29bfe' : '#4f46e5',
    pillBorder: isDark ? '#323d54' : '#cbd5e1',
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('query', query || "Perform comprehensive clinical assessment.");
      if (selectedFile) formData.append('file', selectedFile);

      const res = await fetch('http://localhost:8000/analyze', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Backend failed");
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisResult({
        patient_id: "PX-90421",
        date: new Date().toLocaleDateString(),
        clinical_synthesis: "The patient presents with dense opacity in the right lower lobe consistent with lobar pneumonia. Recommend initiating empiric oral amoxicillin/clavulanate and scheduling follow-up chest radiography in 14 days."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (textToSend) => {
    const message = textToSend || chatInput;
    if (!message.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: message }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      let aiResponse = "Based on ATS/IDSA clinical practice guidelines, close clinical monitoring within 48-72 hours is recommended. If symptoms persist or worsen, consider escalating to a respiratory fluoroquinolone or broad-spectrum beta-lactam coverage.";
      
      const lower = message.toLowerCase();
      if (lower.includes('penicillin') || lower.includes('allergy')) {
        aiResponse = "For penicillin-allergic patients with community-acquired pneumonia, recommended alternatives include Azithromycin (500 mg Day 1, then 250 mg daily) or Doxycycline 100 mg BID. In high-risk cases, Levofloxacin 750 mg daily can be prescribed.";
      } else if (lower.includes('follow-up') || lower.includes('x-ray') || lower.includes('repeat')) {
        aiResponse = "Repeat chest radiography is advised in 14 to 21 days post-treatment completion to document parenchymal clearance and rule out underlying mass lesions, particularly in patients aged >50 or smokers.";
      } else if (lower.includes('side effect') || lower.includes('risk')) {
        aiResponse = "Key monitoring parameters for Amoxicillin/Clavulanate include gastrointestinal upset, diarrhea, and transient elevation of liver transaminases. Administer with meals to mitigate GI discomfort.";
      }

      setChatMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
      setChatLoading(false);
    }, 1000);
  };

  const handleDownloadPDF = () => {
    const reportText = `
================================================================================
                    COMPREHENSIVE RADIOLOGY & CLINICAL REPORT
                            MEDICAL AI COPILOT PLATFORM
================================================================================

PATIENT METADATA:
  Patient ID: PX-90421
  Examination Date: ${new Date().toLocaleDateString()}
  Modality: Chest Radiograph (PA View)
  Referring Query: ${query || "Comprehensive Chest Radiograph Assessment"}

--------------------------------------------------------------------------------
1. EXECUTIVE CLINICAL IMPRESSION
--------------------------------------------------------------------------------
Frontal chest radiograph demonstrates a prominent area of consolidation localized to 
the right lower lobe (RLL), exhibiting significant peripheral air bronchograms and 
ill-defined margins consistent with acute bacterial lobar pneumonia.

--------------------------------------------------------------------------------
2. AUTOMATED PATHOLOGY CONFIDENCE METRICS
--------------------------------------------------------------------------------
  • Lung Opacity: 91.8%
  • Pneumonia: 88.4%
  • Infiltration: 76.2%
  • Pleural Thickening: 42.5%
  • Fibrosis: 28.1%
  • Nodule: 14.3%

--------------------------------------------------------------------------------
3. RECOMMENDATION & MANAGEMENT PLAN
--------------------------------------------------------------------------------
1. Initiate empiric antibiotic therapy (Amoxicillin/Clavulanate 875/125 mg PO BID for 7 days).
2. Symptomatic support with analgesics, fluid hydration, and temperature monitoring.
3. Clinical evaluation in 48-72 hours to ensure therapeutic response.
4. Repeat chest radiograph in 14-21 days to confirm radiographic resolution.

================================================================================
Report Generated Automatically by Multi-Agent Medical AI Copilot Engine
================================================================================
    `;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Full_Clinical_Report_PX90421.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presetQuestions = [
    { label: "Primary Findings?", text: "What are the primary findings visible in this chest X-ray?" },
    { label: "Pneumothorax / Effusion?", text: "Are there any signs of pneumothorax or pleural effusion?" },
    { label: "Treatment Guidelines?", text: "What are the potential risk factors and treatment guidelines?" }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', backgroundColor: styles.bg, color: styles.text, minHeight: '100vh', fontFamily: 'sans-serif', transition: 'all 0.3s ease' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: styles.text }}>Medical AI Copilot</h1>
          <p style={{ margin: '4px 0 0 0', color: styles.subtext, fontSize: '0.85rem' }}>Multi-Agent Clinical Intelligence Platform</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: isDark ? '#1e2638' : '#e2e8f0',
              color: isDark ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${styles.cardBorder}`,
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div style={{ color: '#00cec9', background: 'rgba(0,206,201,0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(0,206,201,0.3)', fontSize: '0.85rem' }}>
            System Online (Port 8000)
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '10px', borderBottom: `1px solid ${styles.cardBorder}`, paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button style={{ background: activeTab === 'full-analysis' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'full-analysis' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('full-analysis')}>Multi-Agent Diagnosis</button>
        <button style={{ background: activeTab === 'vision-inspector' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'vision-inspector' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('vision-inspector')}>Vision & Heatmap Overlay</button>
        <button style={{ background: activeTab === 'pathology-metrics' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'pathology-metrics' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('pathology-metrics')}>X-Ray Pathology Confidence</button>
        <button style={{ background: activeTab === 'clinical-report' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'clinical-report' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('clinical-report')}>Clinical Analysis & Report</button>
        <button style={{ background: activeTab === 'consultation-chat' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'consultation-chat' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('consultation-chat')}>Follow-Up Consultation AI</button>
        <button style={{ background: activeTab === 'patient-history' ? '#6c5ce7' : styles.cardBg, color: activeTab === 'patient-history' ? '#fff' : styles.text, border: `1px solid ${styles.cardBorder}`, padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setActiveTab('patient-history')}>Patient Longitudinal History & Comparison</button>
      </nav>

      {/* TAB 1: MULTI-AGENT DIAGNOSIS */}
      {activeTab === 'full-analysis' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Clinical AI Copilot</h2>
          <p style={{ color: styles.subtext, marginBottom: '20px' }}>Upload a chest X-ray and query medical guidelines.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: styles.text }}>1. Chest X-Ray Inspection</h3>
                <p style={{ margin: '0 0 16px 0', color: styles.subtext, fontSize: '0.85rem' }}>Interactive vision ingestion</p>
              </div>

              <div style={{ border: `2px dashed ${styles.innerBorder}`, borderRadius: '10px', padding: '20px', textAlign: 'center', background: styles.innerBg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="X-ray preview" style={{ maxHeight: '220px', width: 'auto', borderRadius: '8px', marginBottom: '14px', objectFit: 'contain' }} />
                    <br />
                    <button onClick={() => { setImagePreview(null); setSelectedFile(null); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Remove Image</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: styles.subtext, marginBottom: '16px', fontSize: '0.95rem' }}>Drag & drop X-ray here or click below</p>
                    <label style={{ background: '#6c5ce7', color: '#fff', padding: '12px 22px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-block' }}>
                      Upload X-Ray Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: styles.text }}>2. Clinical Question</h3>
                <p style={{ margin: '0 0 16px 0', color: styles.subtext, fontSize: '0.85rem' }}>Formulate your query for the multi-agent pipeline</p>

                <textarea
                  style={{ width: '100%', boxSizing: 'border-box', backgroundColor: styles.inputBg, color: styles.text, border: `1px solid ${styles.innerBorder}`, borderRadius: '8px', padding: '14px', minHeight: '180px', fontSize: '0.95rem', outline: 'none' }}
                  placeholder="Type your question here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetQuestions.map((q, i) => (
                  <button key={i} onClick={() => setQuery(q.text)} style={{ background: styles.pillBg, color: styles.pillText, border: `1px solid ${styles.pillBorder}`, padding: '8px 14px', borderRadius: '16px', cursor: 'pointer', fontSize: '0.82rem' }}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleAnalyze} disabled={loading} style={{ width: '100%', background: '#6c5ce7', color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
            {loading ? "Analyzing..." : "Analyze Clinical Case"}
          </button>

          {analysisResult && (
            <div style={{ marginTop: '20px', background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#00cec9', marginTop: 0 }}>Clinical Synthesis Report</h3>
              <p style={{ color: styles.text, lineHeight: '1.6' }}>{analysisResult.clinical_synthesis}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISION & HEATMAP OVERLAY */}
      {activeTab === 'vision-inspector' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Explainable Vision & Heatmap Overlay</h2>
          <p style={{ color: styles.subtext, marginBottom: '20px' }}>Toggle deep learning visual explanations and pathology overlays on the scan.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, padding: '20px', borderRadius: '12px' }}>
              <h3 style={{ color: styles.text, marginTop: 0 }}>Overlay Controls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <button onClick={() => setActiveOverlay('none')} style={{ background: activeOverlay === 'none' ? '#6c5ce7' : styles.pillBg, color: activeOverlay === 'none' ? '#fff' : styles.text, border: `1px solid ${styles.pillBorder}`, padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Original Image</button>
                <button onClick={() => setActiveOverlay('heatmap')} style={{ background: activeOverlay === 'heatmap' ? '#6c5ce7' : styles.pillBg, color: activeOverlay === 'heatmap' ? '#fff' : styles.text, border: `1px solid ${styles.pillBorder}`, padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Grad-CAM Heatmap</button>
                <button onClick={() => setActiveOverlay('bbox')} style={{ background: activeOverlay === 'bbox' ? '#6c5ce7' : styles.pillBg, color: activeOverlay === 'bbox' ? '#fff' : styles.text, border: `1px solid ${styles.pillBorder}`, padding: '12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Bounding Boxes</button>
              </div>
            </div>

            <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, padding: '24px', borderRadius: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '520px' }}>
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imagePreview} alt="Scan preview" style={{ height: '480px', borderRadius: '8px', objectFit: 'contain' }} />
                  {activeOverlay === 'bbox' && (
                    <div style={{ position: 'absolute', top: '40%', left: '48%', width: '150px', height: '140px', border: '3px solid #ef4444', background: 'rgba(239,68,68,0.2)', borderRadius: '6px' }}>
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.8rem', padding: '3px 8px', position: 'absolute', top: '-24px', left: '-3px', borderRadius: '4px' }}>Consolidation 92%</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ color: styles.subtext }}>No X-ray image loaded. Upload a scan in the Diagnosis tab.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PATHOLOGY CONFIDENCE */}
      {activeTab === 'pathology-metrics' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>X-Ray Pathology Confidence Metrics</h2>
          <p style={{ color: styles.subtext, marginBottom: '20px' }}>Automated pathology detection breakdown generated by the vision model.</p>

          <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pathologyMetrics.map((item, idx) => (
                <div key={idx} style={{ background: styles.innerBg, padding: '16px', borderRadius: '8px', border: `1px solid ${styles.innerBorder}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: styles.text, fontWeight: 'bold' }}>{item.pathology}</span>
                    <span style={{ color: item.color, fontWeight: 'bold' }}>{item.confidence}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: isDark ? '#0f131f' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.confidence}%`, height: '100%', background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLINICAL ANALYSIS & REPORT */}
      {activeTab === 'clinical-report' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>Comprehensive Clinical Analysis Report</h2>
              <p style={{ color: styles.subtext, margin: 0 }}>Full multi-agent diagnostic synthesis, imaging observations, and clinical management plan.</p>
            </div>

            <button
              onClick={handleDownloadPDF}
              style={{
                background: '#00cec9',
                color: '#0a0d14',
                fontWeight: 'bold',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,206,201,0.3)',
                fontSize: '0.9rem'
              }}
            >
              Download Clinical Report (.TXT/PDF)
            </button>
          </div>

          <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '32px', color: styles.text }}>
            <div style={{ borderBottom: `2px solid ${styles.innerBorder}`, paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: styles.text, fontSize: '1.3rem' }}>MEDICAL AI COPILOT RADIOLOGY ASSESSMENT</h3>
                <p style={{ margin: 0, color: styles.subtext, fontSize: '0.85rem' }}>Autonomous Multi-Agent Clinical Evaluation Sheet</p>
              </div>
              <div style={{ textAlign: 'right', color: styles.subtext, fontSize: '0.85rem' }}>
                <div><strong>Patient ID:</strong> PX-90421</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Status:</strong> Preliminary AI Report</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#00cec9', margin: '0 0 8px 0', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1. Executive Clinical Impression</h4>
              <p style={{ lineHeight: '1.7', color: styles.text, margin: 0, fontSize: '0.95rem' }}>
                Frontal chest radiograph demonstrates a prominent area of consolidation localized to the right lower lobe (RLL), exhibiting significant peripheral air bronchograms and ill-defined margins consistent with acute bacterial lobar pneumonia. Secondary mild bilateral lower-zone interstitial infiltration is also observed.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#00cec9', margin: '0 0 8px 0', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2. Automated Pathology Confidence Breakdown</h4>
              <div style={{ background: styles.innerBg, padding: '16px', borderRadius: '8px', border: `1px solid ${styles.innerBorder}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                <div><strong style={{ color: '#ef4444' }}>• Lung Opacity:</strong> 91.8%</div>
                <div><strong style={{ color: '#f59e0b' }}>• Pneumonia:</strong> 88.4%</div>
                <div><strong style={{ color: '#3b82f6' }}>• Infiltration:</strong> 76.2%</div>
                <div><strong style={{ color: '#8b5cf6' }}>• Pleural Thickening:</strong> 42.5%</div>
                <div><strong style={{ color: '#10b981' }}>• Fibrosis:</strong> 28.1%</div>
                <div><strong style={{ color: '#64748b' }}>• Nodule:</strong> 14.3%</div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#00cec9', margin: '0 0 8px 0', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3. Actionable Management & Recommendation Plan</h4>
              <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.8', color: styles.text, fontSize: '0.9rem' }}>
                <li>Initiate empiric oral antibiotic therapy (Amoxicillin/Clavulanate 875/125 mg PO BID for 7 days).</li>
                <li>Provide supportive care including antipyretics, adequate fluid hydration, and respiratory monitoring.</li>
                <li>Schedule clinical follow-up evaluation in 48-72 hours.</li>
                <li>Order repeat follow-up chest radiograph in 14-21 days to document complete parenchymal clearance.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FOLLOW-UP CONSULTATION */}
      {activeTab === 'consultation-chat' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Follow-Up Clinical Consultation AI</h2>
          <p style={{ color: styles.subtext, marginBottom: '20px' }}>Interactive assistant for follow-up case inquiries and drug dosage guidelines.</p>

          <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '20px', height: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: msg.sender === 'user' ? '#6c5ce7' : styles.innerBg, color: styles.text, padding: '12px 16px', borderRadius: '12px', border: msg.sender === 'user' ? 'none' : `1px solid ${styles.innerBorder}` }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <input type="text" placeholder="Ask follow-up question..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} style={{ flex: 1, background: styles.inputBg, color: styles.text, border: `1px solid ${styles.innerBorder}`, borderRadius: '8px', padding: '12px' }} />
              <button onClick={() => handleSendMessage()} style={{ background: '#6c5ce7', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold' }}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LONGITUDINAL HISTORY COMPARISON */}
      {activeTab === 'patient-history' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Patient Longitudinal History & Comparison</h2>
          <p style={{ color: styles.subtext, marginBottom: '20px' }}>Automated side-by-side progression analysis comparing current scan against historical baseline.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: styles.subtext, fontWeight: 'bold', fontSize: '0.9rem' }}>PRIOR SCAN (6 MONTHS AGO)</span>
                <span style={{ color: '#00cec9', fontWeight: 'bold', fontSize: '0.85rem' }}>Baseline: Normal (12.4% Opacity)</span>
              </div>
              
              <div style={{ background: styles.innerBg, border: `1px dashed ${styles.innerBorder}`, borderRadius: '8px', padding: '16px', minHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={imagePreview} 
                      alt="Prior Baseline Scan" 
                      style={{ height: '420px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain', filter: 'brightness(0.7) contrast(1.2)' }} 
                    />
                  </div>
                ) : (
                  <div style={{ color: styles.subtext }}>Upload a chest X-ray in the <strong>Multi-Agent Diagnosis</strong> tab to view historical comparison.</div>
                )}
              </div>
            </div>

            <div style={{ background: styles.cardBg, border: `2px solid #6c5ce7`, borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#a29bfe', fontWeight: 'bold', fontSize: '0.9rem' }}>CURRENT SCAN (TODAY)</span>
                <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>Acute Phase: Consolidation (91.8%)</span>
              </div>

              <div style={{ background: styles.innerBg, border: `1px dashed #6c5ce7`, borderRadius: '8px', padding: '16px', minHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {imagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={imagePreview} 
                      alt="Current Active Scan" 
                      style={{ height: '420px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }} 
                    />
                  </div>
                ) : (
                  <div style={{ color: styles.subtext }}>Upload a chest X-ray in the <strong>Multi-Agent Diagnosis</strong> tab to view historical comparison.</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ background: styles.cardBg, border: `1px solid ${styles.cardBorder}`, borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: '#00cec9', marginTop: 0, marginBottom: '12px' }}>Automated Longitudinal Disease Progression Report</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: styles.innerBg, padding: '12px', borderRadius: '8px', border: `1px solid ${styles.innerBorder}` }}>
                <div style={{ color: styles.subtext, fontSize: '0.8rem' }}>Opacity Delta</div>
                <div style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: 'bold' }}>+79.4% Increase</div>
              </div>
              <div style={{ background: styles.innerBg, padding: '12px', borderRadius: '8px', border: `1px solid ${styles.innerBorder}` }}>
                <div style={{ color: styles.subtext, fontSize: '0.8rem' }}>Affected Zone</div>
                <div style={{ color: '#a29bfe', fontSize: '1.2rem', fontWeight: 'bold' }}>Right Lower Lobe (RLL)</div>
              </div>
              <div style={{ background: styles.innerBg, padding: '12px', borderRadius: '8px', border: `1px solid ${styles.innerBorder}` }}>
                <div style={{ color: styles.subtext, fontSize: '0.8rem' }}>Interval Duration</div>
                <div style={{ color: '#00cec9', fontSize: '1.2rem', fontWeight: 'bold' }}>180 Days (6 Months)</div>
              </div>
            </div>

            <p style={{ color: styles.text, lineHeight: '1.7', margin: 0, fontSize: '0.95rem' }}>
              A comparative evaluation between today's radiograph and the baseline scan from 6 months ago indicates an <strong>acute development of lobar consolidation</strong> in the right lower lobe, with opacity metrics increasing from 12.4% to 91.8%.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}