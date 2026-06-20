import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, User, HelpCircle, BarChart3, Database } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';

const InterviewRepository = () => {
  const { token } = useContext(AuthContext);
  const [experiences, setExperiences] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [verdict, setVerdict] = useState('Selected');
  const [rounds, setRounds] = useState([{ title: 'Online Assessment', description: '' }]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [topics, setTopics] = useState([]);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experiences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setExperiences(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/experiences/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalExperiences = experiences.length;
  const selectedCount = stats?.verdicts?.Selected || 0;
  const frequentTopics = stats?.topTopics?.length || 0;
  const totalQuestions = experiences.reduce((sum, exp) => sum + (Array.isArray(exp.questionsAsked) ? exp.questionsAsked.length : 0), 0);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchExperiences(), fetchStats()]);
      setLoading(false);
    };
    init();
  }, [token]);

  // Dynamic Form actions
  const handleAddRound = () => {
    setRounds(prev => [...prev, { title: `Round ${prev.length + 1}`, description: '' }]);
  };

  const handleRoundChange = (index, field, val) => {
    setRounds(prev => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleRemoveRound = (index) => {
    setRounds(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions(prev => [...prev, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopics(prev => [...prev, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!companyName || !role) return;

    const payload = {
      companyName,
      role,
      difficulty,
      verdict,
      rounds,
      questionsAsked: questions,
      topics
    };

    try {
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        // Clear Form
        setCompanyName('');
        setRole('');
        setDifficulty('Medium');
        setVerdict('Selected');
        setRounds([{ title: 'Online Assessment', description: '' }]);
        setQuestions([]);
        setTopics([]);
        setShowAddForm(false);
        // Reload feeds
        await Promise.all([fetchExperiences(), fetchStats()]);
      } else {
        alert(data.message || 'Failed to submit experience');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading experiences database...</p>
      </div>
    );
  }

  const chartColors = ['#6366f1', '#a855f7', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
  const topTopicsData = stats?.topTopics || [];
  const topQuestionsData = stats?.topQuestions || [];
  const verdictChartData = stats ? Object.keys(stats.verdicts).map(key => ({ name: key, value: stats.verdicts[key] })) : [];

  return (
    <div className="animate-fade-in" style={{ padding: '20px 40px 40px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingBottom: '8px' }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: '700', color: '#FFFFFF' }}>Interview Experience Repository</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', maxWidth: '640px' }}>Review shared interview journeys, performance trends, and preparation insights in one place.</p>
        </div>

        <button onClick={() => setShowAddForm(!showAddForm)} className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
          <Plus size={18} /> {showAddForm ? 'Close Form' : 'Share Interview Experience'}
        </button>
      </div>

      {/* Analytics Summary Panels */}
      {!showAddForm && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Interview Experience Insights</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Total entries', value: totalExperiences, color: 'var(--color-primary)' },
                  { label: 'Selected offers', value: selectedCount, color: 'var(--color-success)' },
                  { label: 'Frequent topics', value: frequentTopics, color: 'var(--color-secondary)' },
                  { label: 'Questions logged', value: totalQuestions, color: 'var(--color-warning)' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>{item.label}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Most Asked Topics */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={16} color="var(--color-primary)" /> Most Asked SDE Topics
              </h4>
              <div style={{ width: '100%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTopicsData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={10} hide />
                  <YAxis dataKey="topic" type="category" stroke="var(--text-secondary)" fontSize={10} width={110} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Asked Questions */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--color-warning)" /> Frequently Asked Questions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
              {topQuestionsData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--color-warning)' }}>Q.</span>
                  <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{item.question}</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{item.count}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verdict Distribution */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} color="var(--color-success)" /> Verdict Distribution
            </h4>
            <div style={{ width: '100%', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verdictChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {verdictChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-light)', borderRadius: '8px', color: '#FFFFFF', padding: '10px 12px' }}
                    itemStyle={{ color: '#FFFFFF' }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: 700 }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
      )}

      {/* Share Experience Collapsible Form */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>Post Your Interview Experience</h3>
          
          <form onSubmit={handleSaveExperience} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Company Name *</label>
                <input 
                  type="text" 
                  required 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Cisco"
                  className="glass-input"
                />
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Role *</label>
                <input 
                  type="text" 
                  required 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. SDE Intern"
                  className="glass-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Difficulty Level</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="glass-input">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Verdict</label>
                <select value={verdict} onChange={(e) => setVerdict(e.target.value)} className="glass-input">
                  <option value="Selected">Selected (Offer Received)</option>
                  <option value="Rejected">Rejected</option>
                  <option value="No Offer">No Offer (Pending/Other)</option>
                </select>
              </div>
            </div>

            {/* Rounds configuration */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Rounds Descriptions</label>
                <button type="button" onClick={handleAddRound} className="glass-button-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>+ Add Round</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rounds.map((rnd, idx) => (
                  <div key={idx} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        value={rnd.title}
                        onChange={(e) => handleRoundChange(idx, 'title', e.target.value)}
                        placeholder="Round Title (e.g. OA, Technical)"
                        className="glass-input"
                        style={{ flex: 1, minWidth: '150px' }}
                      />
                      <button type="button" onClick={() => handleRemoveRound(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                    </div>
                    <textarea
                      value={rnd.description}
                      onChange={(e) => handleRoundChange(idx, 'description', e.target.value)}
                      placeholder="Briefly describe what happened in this round..."
                      className="glass-input"
                      rows="2"
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Add Questions asked */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Questions Asked</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Difference between BFS and DFS"
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddQuestion} className="glass-button-secondary">Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {questions.map((q, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px' }}>
                    <span>{q}</span>
                    <button type="button" onClick={() => setQuestions(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics tags */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>DSA / SQL / Academic Topic Tags</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Graphs, OOP, SQL, Networks"
                  className="glass-input"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddTopic} className="glass-button-secondary">Tag</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {topics.map((t, idx) => (
                  <span 
                    key={idx}
                    style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {t}
                    <button type="button" onClick={() => setTopics(prev => prev.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: '700' }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="glass-button-secondary">Cancel</button>
              <button type="submit" className="glass-button">Submit Experience</button>
            </div>

          </form>
        </div>
      )}

      {/* Main Experience Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          Interview Experiences Feed
        </h4>

        {experiences.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>No interview experiences match your query.</p>
        ) : (
          experiences.map(exp => (
            <div key={exp._id} className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Header block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700' }}>{exp.companyName}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.role}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`status-badge ${exp.verdict === 'Selected' ? 'status-selected' : exp.verdict === 'Rejected' ? 'status-rejected' : 'status-applied'}`}>
                    {exp.verdict === 'Selected' ? 'Selected' : exp.verdict === 'Rejected' ? 'Rejected' : 'No Offer'}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-light)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: exp.difficulty === 'Easy' ? 'var(--color-success)' : exp.difficulty === 'Medium' ? 'var(--color-warning)' : 'var(--color-danger)'
                  }}>
                    {exp.difficulty}
                  </span>
                </div>
              </div>

              {/* Rounds breakdown */}
              {exp.rounds && exp.rounds.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rounds Breakdown</span>
                  {exp.rounds.map((rnd, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{rnd.title}</span>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{rnd.description || 'No description provided'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions asked */}
              {exp.questionsAsked && exp.questionsAsked.length > 0 && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Questions Asked</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {exp.questionsAsked.map((q, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', gap: '8px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-warning)' }}>•</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic tags */}
              {exp.topics && exp.topics.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                  {exp.topics.map((t, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-light)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Author footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-end', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                <User size={10} />
                <span>Shared by: {exp.studentName} • {new Date(exp.createdAt).toLocaleDateString()}</span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default InterviewRepository;
