import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, GitFork, HelpCircle, CheckSquare, Trash2, ArrowRight, BookOpen } from 'lucide-react';

const PrepRoadmaps = () => {
  const { token } = useContext(AuthContext);
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch('/api/roadmaps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRoadmaps(data.data);
        if (data.data.length > 0) {
          setSelectedRoadmap(data.data[0]);
        } else {
          setSelectedRoadmap(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [token]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!company || !role) return;

    setGenerating(true);
    setGenMessage('Querying recruiter profile target database...');

    const intervals = [
      setTimeout(() => setGenMessage('Compiling company-specific SDE core concepts...'), 1500),
      setTimeout(() => setGenMessage('Cross-referencing your resume skill vectors...'), 3500),
      setTimeout(() => setGenMessage('Formulating custom technical & behavioral interview questions...'), 6000),
      setTimeout(() => setGenMessage('Finalizing structured roadmap modules...'), 8500)
    ];

    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ company, role })
      });
      const data = await res.json();
      
      intervals.forEach(clearTimeout);

      if (data.success) {
        setCompany('');
        setRole('');
        fetchRoadmaps();
      } else {
        alert(data.message || 'Roadmap generation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error during generation');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this preparation roadmap?')) return;

    try {
      const res = await fetch(`/api/roadmaps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (selectedRoadmap && selectedRoadmap._id === id) {
          const remaining = roadmaps.filter(r => r._id !== id);
          setSelectedRoadmap(remaining.length > 0 ? remaining[0] : null);
        }
        fetchRoadmaps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading preparation roadmaps...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px 40px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Left Form: Generate roadmap */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
            <Sparkles size={18} />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Create Custom Prep Roadmap
            </h4>
          </div>

          {generating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: '16px', textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>
                <h5 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '0.95rem' }}>Gemini Generating...</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', minHeight: '32px' }}>{genMessage}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Target Company</label>
                <input 
                  type="text" 
                  required 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Cisco, Amazon, Google"
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Target Role</label>
                <input 
                  type="text" 
                  required 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer, SDE"
                  className="glass-input"
                />
              </div>

              <button type="submit" className="glass-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                <Sparkles size={16} /> Generate Roadmap
              </button>
            </form>
          )}
        </div>

        {/* Right saved roadmaps selection stack */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '700', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            Saved Preparation Roadmaps
          </h4>

          {roadmaps.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              padding: '30px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <GitFork size={30} style={{ opacity: 0.15 }} />
              <span style={{ fontSize: '0.8rem' }}>No roadmaps created yet. Fill out the target form to trigger.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }}>
              {roadmaps.map(r => {
                const isSelected = selectedRoadmap && selectedRoadmap._id === r._id;
                return (
                  <div
                    key={r._id}
                    onClick={() => setSelectedRoadmap(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255,255,255,0.02)',
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-light)',
                      transition: 'var(--transition-smooth)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <GitFork size={16} color={isSelected ? 'var(--color-primary)' : 'var(--text-secondary)'} />
                      <div style={{ overflow: 'hidden' }}>
                        <h5 style={{ fontSize: '0.85rem', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.company}</h5>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.role}</p>
                      </div>
                    </div>

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
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Details Display Section */}
      <div style={{ width: '100%' }}>
        {selectedRoadmap ? (
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header info */}
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', marginBottom: '6px' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tailored Preparation Matrix</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: '800' }}>
                {selectedRoadmap.company} — {selectedRoadmap.role}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Roadmap compiled: {new Date(selectedRoadmap.generatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Focus areas tags */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <BookOpen size={16} color="var(--color-info)" /> Focus Study Areas
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedRoadmap.focusAreas && selectedRoadmap.focusAreas.map((area, idx) => (
                  <span 
                    key={idx}
                    style={{
                      background: 'rgba(14, 165, 233, 0.08)',
                      color: '#38bdf8',
                      border: '1px solid rgba(14, 165, 233, 0.25)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid for Topics checklist and Mock Questions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              
              {/* Checklists topics */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <CheckSquare size={16} color="var(--color-primary)" /> Important Topics to Master
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedRoadmap.topics && selectedRoadmap.topics.map((topic, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                      <input type="checkbox" style={{ marginTop: '3px', accentColor: 'var(--color-primary)' }} />
                      <span style={{ color: topic.includes('Missing') ? '#fbbf24' : 'inherit', fontWeight: topic.includes('Missing') ? '600' : 'normal' }}>
                        {topic}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Accordion list of questions */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <HelpCircle size={16} color="var(--color-warning)" /> Sample Interview Questions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedRoadmap.interviewQuestions && selectedRoadmap.interviewQuestions.map((q, idx) => (
                    <div 
                      key={idx}
                      className="glass-panel" 
                      style={{
                        padding: '12px 14px',
                        fontSize: '0.8rem',
                        lineHeight: '1.4',
                        backgroundColor: 'rgba(255,255,255,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-warning)' }}>Q{idx + 1}.</span>
                        <span>{q}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-panel" style={{
            padding: '60px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px'
          }}>
            <GitFork size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
            <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '8px' }}>Select Roadmap</h4>
            <p style={{ fontSize: '0.875rem' }}>Create a new preparation roadmap to view tailored modules here.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PrepRoadmaps;
