import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Upload, FileType, Sparkles, Loader } from 'lucide-react';

const ResumeUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Only PDF resumes are supported.');
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    setLoadingMessage('Initializing document extraction pipeline...');

    // Simulate loader steps to engage user
    const intervals = [
      setTimeout(() => setLoadingMessage('Reading PDF text vectors...'), 1500),
      setTimeout(() => setLoadingMessage('Invoking Gemini API models...'), 3500),
      setTimeout(() => setLoadingMessage('Analyzing SDE skill gaps & scoring ATS compatibility...'), 6000),
      setTimeout(() => setLoadingMessage('Generating layout optimization tips...'), 9500)
    ];

    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      // Clear intervals
      intervals.forEach(clearTimeout);

      if (data.success) {
        onUploadSuccess();
        onClose();
      } else {
        alert(data.message || 'Analysis failed. Please verify PDF formatting.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during file upload');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        padding: '30px',
        animation: 'fadeIn 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Close Button (only if not loading) */}
        {!loading && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        )}

        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 0',
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 1.2s linear infinite'
              }}></div>
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <Sparkles size={24} style={{ animation: 'pulse 2s infinite' }} />
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
                Analyzing with Gemini AI
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', minHeight: '40px', maxWidth: '320px' }}>
                {loadingMessage}
              </p>
            </div>
            
            {/* Adding standard spinner rotation keyframe in inline styles */}
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.15); opacity: 0.7; }
              }
            `}</style>
          </div>
        ) : (
          <>
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              marginBottom: '20px'
            }}>
              <Upload size={24} />
            </div>

            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.35rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '8px'
            }}>Upload Resume (PDF)</h3>
            
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              marginBottom: '24px',
              maxWidth: '320px'
            }}>
              Our Gemini AI parser will extract your SDE skill competencies, identify gaps, and calculate your compatibility score.
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{
                  border: '2px dashed var(--border-light)',
                  borderRadius: '12px',
                  padding: '30px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  backgroundColor: file ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  borderColor: file ? 'var(--color-primary)' : 'var(--border-light)',
                  transition: 'var(--transition-smooth)'
                }}
                onClick={() => document.getElementById('resumeFileInput').click()}
              >
                <input 
                  type="file" 
                  id="resumeFileInput"
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
                
                {file ? (
                  <>
                    <FileType size={32} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={28} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Select PDF resume file</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maximum file size: 5MB</span>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%', marginTop: '10px' }}>
                <button type="button" onClick={onClose} className="glass-button-secondary">Cancel</button>
                <button type="submit" disabled={!file} className="glass-button" style={{ opacity: file ? 1 : 0.5, cursor: file ? 'pointer' : 'not-allowed' }}>
                  Analyze Resume
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadModal;
