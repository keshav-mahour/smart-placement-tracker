import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ApplicationModal from '../components/ApplicationModal';
import { 
  Plus, 
  LayoutGrid, 
  TableProperties, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Tracker = () => {
  const { token } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View mode toggles
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = companies.filter(c => c.deadline && new Date(c.deadline) >= now && new Date(c.deadline) <= nextWeek).length;
  const activeApplications = companies.filter(c => c.status !== 'Selected' && c.status !== 'Rejected').length;
  const totalOffers = companies.filter(c => c.status === 'Selected').length;
  const totalRejections = companies.filter(c => c.status === 'Rejected').length;

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedCompany(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  // Status transitions
  const statuses = ['Applied', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Selected'];

  const moveStatus = async (company, direction) => {
    const currentIndex = statuses.indexOf(company.status);
    let newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= statuses.length) return;
    const newStatus = statuses[newIndex];

    try {
      const res = await fetch(`/api/companies/${company._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToRejected = async (company) => {
    try {
      const res = await fetch(`/api/companies/${company._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Rejected' })
      });
      const data = await res.json();
      if (data.success) {
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'var(--color-success)';
    if (diff === 'Medium') return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading tracked application board...</p>
      </div>
    );
  }

  // Group columns for Kanban
  const kanbanColumns = {
    'Applied': companies.filter(c => c.status === 'Applied'),
    'Online Assessment': companies.filter(c => c.status === 'Online Assessment'),
    'Technical Interview': companies.filter(c => c.status === 'Technical Interview'),
    'HR Interview': companies.filter(c => c.status === 'HR Interview'),
    'Offers': companies.filter(c => c.status === 'Selected'),
    'Rejections': companies.filter(c => c.status === 'Rejected')
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 40px 40px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subheader controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Toggle Mode */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '4px'
        }}>
          <button 
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'kanban' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <LayoutGrid size={16} /> Kanban Board
          </button>
          <button 
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              background: viewMode === 'table' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              fontSize: '0.85rem',
              transition: 'var(--transition-smooth)'
            }}
          >
            <TableProperties size={16} /> Tabular List
          </button>
        </div>

        {/* Add Application Button */}
        <button onClick={handleOpenAddModal} className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Application
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        {[
          { label: 'Open Applications', value: activeApplications, color: 'var(--color-primary)' },
          { label: 'Upcoming Deadlines', value: upcomingDeadlines, color: 'var(--color-warning)' },
          { label: 'Offers Secured', value: totalOffers, color: 'var(--color-success)' },
          { label: 'Rejections', value: totalRejections, color: 'var(--color-danger)' }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Render Kanban Board */}
      {viewMode === 'kanban' && (
        <div style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          paddingBottom: '20px',
          minHeight: '65vh',
          alignItems: 'flex-start'
        }}>
          {Object.keys(kanbanColumns).map(columnName => {
            const colCompanies = kanbanColumns[columnName];
            const isOffer = columnName === 'Offers';
            const isReject = columnName === 'Rejections';
            
            return (
              <div 
                key={columnName}
                className="glass-panel" 
                style={{
                  minWidth: '280px',
                  width: '320px',
                  maxHeight: '70vh',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  gap: '16px',
                  backgroundColor: isOffer ? 'rgba(16, 185, 129, 0.02)' : isReject ? 'rgba(239, 68, 68, 0.02)' : 'var(--bg-card)'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '12px'
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    color: isOffer ? '#34d399' : isReject ? '#f87171' : 'var(--text-primary)'
                  }}>{columnName}</h4>
                  <span style={{
                    background: 'rgba(255,255,255,0.05)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>{colCompanies.length}</span>
                </div>

                {/* Column Cards Container */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto',
                  flex: 1,
                  paddingRight: '4px'
                }}>
                  {colCompanies.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      padding: '40px 0',
                      border: '1px dashed var(--border-light)',
                      borderRadius: '8px'
                    }}>No applications here</div>
                  ) : (
                    colCompanies.map(company => (
                      <div 
                        key={company._id} 
                        className="glass-card-interactive"
                        style={{
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          borderColor: isOffer ? 'rgba(16, 185, 129, 0.2)' : isReject ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-light)'
                        }}
                      >
                        {/* Company Details */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: '700' }}>{company.name}</h5>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleOpenEditModal(company)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} title="Edit">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDelete(company._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{company.role}</p>
                        </div>

                        {/* Package & Tags */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-success)' }}>{company.package} LPA</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                              {company.category}
                            </span>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              background: `rgba(${company.difficulty === 'Easy' ? '16,185,129' : company.difficulty === 'Medium' ? '245,158,11' : '239,68,68'}, 0.08)`, 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              color: getDifficultyColor(company.difficulty),
                              fontWeight: '600'
                            }}>
                              {company.difficulty}
                            </span>
                          </div>
                        </div>

                        {/* Deadline Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          <Calendar size={12} />
                          <span>Deadline: {new Date(company.deadline).toLocaleDateString()}</span>
                        </div>

                        {/* Event Alerts (OA / Interview) */}
                        {(company.testDate && company.status === 'Online Assessment') && (
                          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#fbbf24' }}>
                            <AlertCircle size={12} />
                            <span>OA: {new Date(company.testDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {(company.interviewDate && (company.status === 'Technical Interview' || company.status === 'HR Interview')) && (
                          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#818cf8' }}>
                            <AlertCircle size={12} />
                            <span>Interview: {new Date(company.interviewDate).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Transition Navigation Controls */}
                        {!isReject && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderTop: '1px solid var(--border-light)',
                            paddingTop: '10px',
                            marginTop: '4px'
                          }}>
                            {/* Left Transition Arrow */}
                            <button 
                              disabled={company.status === 'Applied'}
                              onClick={() => moveStatus(company, -1)}
                              style={{ 
                                background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: company.status === 'Applied' ? 'not-allowed' : 'pointer', opacity: company.status === 'Applied' ? 0.3 : 1 
                              }}
                            >
                              <ChevronLeft size={16} />
                            </button>

                            {/* Fail/Reject Button */}
                            {company.status !== 'Selected' && (
                              <button 
                                onClick={() => handleMoveToRejected(company)}
                                style={{
                                  background: 'none', border: 'none', color: '#f87171', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer'
                                }}
                              >
                                Reject
                              </button>
                            )}

                            {/* Right Transition Arrow */}
                            <button 
                              disabled={company.status === 'Selected'}
                              onClick={() => moveStatus(company, 1)}
                              style={{ 
                                background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: company.status === 'Selected' ? 'not-allowed' : 'pointer', opacity: company.status === 'Selected' ? 0.3 : 1 
                              }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Render Tabular View */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '10px 0' }}>
          {companies.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>No companies tracked yet. Click Add Application.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px' }}>Company</th>
                  <th style={{ padding: '16px 24px' }}>Role</th>
                  <th style={{ padding: '16px 24px' }}>Package (LPA)</th>
                  <th style={{ padding: '16px 24px' }}>Category</th>
                  <th style={{ padding: '16px 24px' }}>Difficulty</th>
                  <th style={{ padding: '16px 24px' }}>Status</th>
                  <th style={{ padding: '16px 24px' }}>Deadline</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.875rem' }}>
                {companies.map(company => (
                  <tr 
                    key={company._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'var(--transition-smooth)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '16px 24px', fontWeight: '700' }}>{company.name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{company.role}</td>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--color-success)' }}>{company.package} LPA</td>
                    <td style={{ padding: '16px 24px' }}>{company.category}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        color: getDifficultyColor(company.difficulty),
                        fontWeight: '600'
                      }}>{company.difficulty}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`status-badge ${
                        company.status === 'Applied' ? 'status-applied' :
                        company.status === 'Online Assessment' ? 'status-oa' :
                        company.status === 'Technical Interview' ? 'status-tech' :
                        company.status === 'HR Interview' ? 'status-hr' :
                        company.status === 'Selected' ? 'status-selected' : 'status-rejected'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{new Date(company.deadline).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '10px' }}>
                        <button onClick={() => handleOpenEditModal(company)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '6px', padding: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(company._id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '6px', color: '#f87171', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Global Application Modal Form */}
      <ApplicationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        companyToEdit={selectedCompany} 
        onSave={fetchCompanies} 
      />

    </div>
  );
};

export default Tracker;
