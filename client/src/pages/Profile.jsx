import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Shield, Target, PlusCircle, CheckCircle, Database } from 'lucide-react';

const Profile = () => {
  const { user, token, updateProfile, error, setError } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [dreamRole, setDreamRole] = useState('');
  const [dreamCompany, setDreamCompany] = useState('');
  
  // Readiness log states
  const [dsaProblems, setDsaProblems] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [mocksCount, setMocksCount] = useState(0);

  // Password update
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDreamRole(user.dreamRole || '');
      setDreamCompany(user.dreamCompany || '');
      if (user.readinessLog) {
        setDsaProblems(user.readinessLog.dsaProblems || 0);
        setProjectsCount(user.readinessLog.projectsCount || 0);
        setMocksCount(user.readinessLog.mocksCount || 0);
      }
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const payload = {
      name,
      dreamRole,
      dreamCompany,
      readinessLog: {
        dsaProblems: parseInt(dsaProblems),
        projectsCount: parseInt(projectsCount),
        mocksCount: parseInt(mocksCount)
      }
    };

    if (password.trim()) {
      payload.password = password;
    }

    const ok = await updateProfile(payload);
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px 40px 40px', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: '700', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
          Profile & Readiness Parameters
        </h3>

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#34d399',
            fontSize: '0.82rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ✓ Profile settings and readiness logs successfully updated.
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '0.82rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Account details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
              <User size={16} /> Account Information
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="glass-input" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Change Password (Optional)</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Leave blank to keep current" 
                  className="glass-input" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Goals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
              <Target size={16} /> Career Aspirations
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Dream Company Target</label>
                <input 
                  type="text" 
                  value={dreamCompany} 
                  onChange={(e) => setDreamCompany(e.target.value)} 
                  placeholder="e.g. Cisco" 
                  className="glass-input" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Dream Role Target</label>
                <input 
                  type="text" 
                  value={dreamRole} 
                  onChange={(e) => setDreamRole(e.target.value)} 
                  placeholder="e.g. Systems Engineer" 
                  className="glass-input" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Readiness parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
              <Database size={16} /> Preparation Progress Logs
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Provide details regarding your study progress. These metrics are dynamically mapped with weighted factors to compute your dashboard Placement Readiness Score.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>DSA Questions Solved (Target: 300)</label>
                <input 
                  type="number" 
                  value={dsaProblems} 
                  onChange={(e) => setDsaProblems(Math.max(0, parseInt(e.target.value) || 0))} 
                  className="glass-input" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Portfolio Projects (Target: 3)</label>
                <input 
                  type="number" 
                  value={projectsCount} 
                  onChange={(e) => setProjectsCount(Math.max(0, parseInt(e.target.value) || 0))} 
                  className="glass-input" 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Mock Interviews (Target: 5)</label>
                <input 
                  type="number" 
                  value={mocksCount} 
                  onChange={(e) => setMocksCount(Math.max(0, parseInt(e.target.value) || 0))} 
                  className="glass-input" 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
            <button type="submit" disabled={loading} className="glass-button">
              {loading ? 'Saving Settings...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Profile;
