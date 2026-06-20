import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ResumeUploadModal from '../components/ResumeUploadModal';
import AnalysisPanel from '../components/AnalysisPanel';
import { Upload, Sparkles, Trash2, Calendar, FileText, ChevronRight, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResumeManager = () => {
  const { token } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setResumes(data.data);
        if (data.data.length > 0) {
          setSelectedResume(data.data[0]); // Select latest by default
        } else {
          setSelectedResume(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [token]);

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid selecting deleted item
    if (!window.confirm('Are you sure you want to delete this resume version?')) return;

    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // If deleted selected, select another
        if (selectedResume && selectedResume._id === id) {
          const remaining = resumes.filter(r => r._id !== id);
          setSelectedResume(remaining.length > 0 ? remaining[0] : null);
        }
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compile history for trend chart (reverse list for chronological order: V1 -> V2 -> V3)
  const chartData = [...resumes]
    .reverse()
    .map(r => ({
      name: r.versionLabel,
      score: r.score
    }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading resume portfolio database...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px 40px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Controls Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>Resume ATS Feedback Center</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload multiple versions of your resume and track score improvements over time.</p>
        </div>
        <button onClick={() => setUploadModalOpen(true)} className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Upload New Version
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="glass-panel" style={{ padding: '22px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Resume Portfolio</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{resumes.length} version{resumes.length === 1 ? '' : 's'} uploaded</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedResume ? `Current selection: ${selectedResume.versionLabel} (${selectedResume.score} pts)` : 'Upload a resume to activate ATS feedback.'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Average Performance</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>{resumes.length ? `${(resumes.reduce((sum, r) => sum + (r.score || 0), 0) / resumes.length).toFixed(0)} pts` : '--'}</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Score trend helps you refine your resume for better application success.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Version List & Trend Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Trend Chart (only if we have at least 2 versions to map a line) */}
          {chartData.length >= 2 && (
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score Improvement Trend</span>
              </div>
              <div style={{ width: '100%', height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                    <YAxis stroke="var(--text-secondary)" fontSize={10} domain={[40, 100]} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="var(--color-success)" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* List panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '700', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              Uploaded Versions
            </h4>

            {resumes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '40px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FileText size={36} style={{ opacity: 0.15 }} />
                <span style={{ fontSize: '0.8rem' }}>No resumes uploaded. Please upload a PDF to trigger Gemini review.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '380px' }}>
                {resumes.map(r => {
                  const isSelected = selectedResume && selectedResume._id === r._id;
                  return (
                    <div
                      key={r._id}
                      onClick={() => setSelectedResume(r)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-light)',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-light)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{
                          background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)'
                        }}>
                          <FileText size={18} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <h5 style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: '700', 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden', 
                            whiteSpace: 'nowrap',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}>{r.versionLabel}</h5>
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Calendar size={10} />
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          color: r.score >= 80 ? 'var(--color-success)' : r.score >= 65 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}>{r.score} pts</span>
                        
                        <button
                          onClick={(e) => handleDelete(r._id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '50%',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          title="Delete version"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Detailed Analysis Insights */}
        <div style={{ flex: 1.5 }}>
          <AnalysisPanel resume={selectedResume} />
        </div>

      </div>

      {/* Upload Modal Overlay */}
      <ResumeUploadModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={fetchResumes}
      />

    </div>
  );
};

export default ResumeManager;
