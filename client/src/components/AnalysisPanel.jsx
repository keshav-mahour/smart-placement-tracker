import React from 'react';
import { Award, AlertCircle, CheckCircle, Lightbulb, TrendingUp } from 'lucide-react';

const AnalysisPanel = ({ resume }) => {
  if (!resume) {
    return (
      <div className="glass-panel" style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '300px'
      }}>
        <Award size={48} style={{ color: 'rgba(255, 255, 255, 0.15)', marginBottom: '16px' }} />
        <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>No Resume Selected</h4>
        <p style={{ fontSize: '0.875rem' }}>Select a resume from the list or upload a new version to view AI analysis.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 65) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const scoreColor = getScoreColor(resume.score);

  return (
    <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--color-primary)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>{resume.versionLabel}</span>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '700', marginTop: '4px' }}>
            {resume.filename}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Uploaded: {new Date(resume.createdAt).toLocaleDateString()} at {new Date(resume.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* ATS Score Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
            {/* Simple SVG Circular Progress */}
            <svg style={{ transform: 'rotate(-90deg)', width: '70px', height: '70px' }}>
              <circle 
                cx="35" cy="35" r="28" 
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="6" 
              />
              <circle 
                cx="35" cy="35" r="28" 
                fill="none" 
                stroke={scoreColor} 
                strokeWidth="6" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - resume.score / 100)}
                style={{ strokeLinecap: 'round', transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: '800',
              fontFamily: 'var(--font-display)',
              fontSize: '1.2rem',
              color: scoreColor
            }}>
              {resume.score}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>ATS Match Rating</span>
            <span style={{ 
              fontSize: '0.75rem', 
              color: scoreColor, 
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              {resume.score >= 80 ? 'Premium Resume' : resume.score >= 65 ? 'Competitive Match' : 'Attention Required'}
            </span>
          </div>
        </div>
      </div>

      {/* Extracted Skills */}
      <div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CheckCircle size={16} color="var(--color-success)" /> Extracted Skills
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {resume.skills && resume.skills.length > 0 ? (
            resume.skills.map((skill, index) => (
              <span 
                key={index}
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No skills extracted</span>
          )}
        </div>
      </div>

      {/* Missing Skills (Skill Gaps) */}
      <div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertCircle size={16} color="var(--color-warning)" /> Missing Target Skills
        </h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {resume.analysis?.missingSkills && resume.analysis.missingSkills.length > 0 ? (
            resume.analysis.missingSkills.map((skill, index) => (
              <span 
                key={index}
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-success)', fontWeight: '500' }}>✓ None! You have all major competencies.</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {/* Weak Areas */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'rgba(239, 68, 68, 0.02)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fca5a5' }}>
            <AlertCircle size={16} /> Weak Areas
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resume.analysis?.weakAreas && resume.analysis.weakAreas.length > 0 ? (
              resume.analysis.weakAreas.map((w, index) => (
                <li key={index} style={{ lineHeight: '1.4' }}>{w}</li>
              ))
            ) : (
              <li style={{ listStyleType: 'none', color: 'var(--text-success)' }}>No major structural weaknesses identified.</li>
            )}
          </ul>
        </div>

        {/* Improvement Tips */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'rgba(168, 85, 247, 0.02)', borderColor: 'rgba(168, 85, 247, 0.1)' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#c084fc' }}>
            <Lightbulb size={16} /> Improvement Tips
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resume.analysis?.improvementTips && resume.analysis.improvementTips.length > 0 ? (
              resume.analysis.improvementTips.map((tip, index) => (
                <li key={index} style={{ lineHeight: '1.4' }}>{tip}</li>
              ))
            ) : (
              <li style={{ listStyleType: 'none', color: 'var(--text-success)' }}>Your resume formatting looks excellent!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
