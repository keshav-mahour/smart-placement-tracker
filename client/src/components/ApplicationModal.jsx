import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Calendar } from 'lucide-react';

const ApplicationModal = ({ isOpen, onClose, companyToEdit, onSave }) => {
  const { token } = useContext(AuthContext);
  const [resumes, setResumes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    package: '',
    deadline: '',
    status: 'Applied',
    category: 'Product',
    difficulty: 'Medium',
    resumeId: '',
    notes: '',
    testDate: '',
    interviewDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch user resumes to populate dropdown
      const fetchResumes = async () => {
        try {
          const res = await fetch('/api/resumes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setResumes(data.data);
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchResumes();

      // Populate if edit mode
      if (companyToEdit) {
        setFormData({
          name: companyToEdit.name || '',
          role: companyToEdit.role || '',
          package: companyToEdit.package || '',
          deadline: companyToEdit.deadline ? companyToEdit.deadline.split('T')[0] : '',
          status: companyToEdit.status || 'Applied',
          category: companyToEdit.category || 'Product',
          difficulty: companyToEdit.difficulty || 'Medium',
          resumeId: companyToEdit.resumeId || '',
          notes: companyToEdit.notes || '',
          testDate: companyToEdit.testDate ? companyToEdit.testDate.split('T')[0] : '',
          interviewDate: companyToEdit.interviewDate ? companyToEdit.interviewDate.split('T')[0] : ''
        });
      } else {
        // Reset form
        setFormData({
          name: '',
          role: '',
          package: '',
          deadline: '',
          status: 'Applied',
          category: 'Product',
          difficulty: 'Medium',
          resumeId: '',
          notes: '',
          testDate: '',
          interviewDate: ''
        });
      }
    }
  }, [isOpen, companyToEdit, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare payload
    const payload = {
      ...formData,
      package: parseFloat(formData.package),
      resumeId: formData.resumeId || null,
      testDate: formData.testDate || null,
      interviewDate: formData.interviewDate || null
    };

    const url = companyToEdit ? `/api/companies/${companyToEdit._id}` : '/api/companies';
    const method = companyToEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert(data.message || 'Failed to save application');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '30px',
        animation: 'fadeIn 0.3s ease'
      }}>
        {/* Close Button */}
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

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '24px',
          background: 'linear-gradient(to right, #ffffff, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {companyToEdit ? 'Edit Application Details' : 'Add New Company Application'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Company Name & Role */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Company Name *</label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="glass-input" 
                placeholder="e.g. Cisco"
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Role *</label>
              <input 
                type="text" 
                name="role" 
                required 
                value={formData.role} 
                onChange={handleChange} 
                className="glass-input" 
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>

          {/* Package & Category */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Package Offered (LPA) *</label>
              <input 
                type="number" 
                step="0.1"
                name="package" 
                required 
                value={formData.package} 
                onChange={handleChange} 
                className="glass-input" 
                placeholder="e.g. 15"
              />
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="glass-input" style={{ appearance: 'none' }}>
                <option value="Product">Product</option>
                <option value="MNC">MNC</option>
                <option value="Startup">Startup</option>
                <option value="Service">Service</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '130px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="glass-input" style={{ appearance: 'none' }}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Status & Resume Link */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Application Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="glass-input" style={{ appearance: 'none' }}>
                <option value="Applied">Applied</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Selected">Selected (Offer)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Linked Resume Version</label>
              <select name="resumeId" value={formData.resumeId} onChange={handleChange} className="glass-input" style={{ appearance: 'none' }}>
                <option value="">No Resume Linked</option>
                {resumes.map(r => (
                  <option key={r._id} value={r._id}>{r.versionLabel} - {r.filename} ({r.score} pts)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates: Deadline, OA, Interview */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Deadline Date *</label>
              <input 
                type="date" 
                name="deadline" 
                required 
                value={formData.deadline} 
                onChange={handleChange} 
                className="glass-input" 
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>OA Test Date (If status OA)</label>
              <input 
                type="date" 
                name="testDate" 
                value={formData.testDate} 
                onChange={handleChange} 
                className="glass-input" 
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Interview Date (If Interview stage)</label>
              <input 
                type="date" 
                name="interviewDate" 
                value={formData.interviewDate} 
                onChange={handleChange} 
                className="glass-input" 
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Preparation Notes / Feedback</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="glass-input" 
              rows="3" 
              placeholder="e.g. Focus on binary search, graphs. Dress formally. Online coding environment info..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="glass-button-secondary">Cancel</button>
            <button type="submit" className="glass-button">Save Application</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
