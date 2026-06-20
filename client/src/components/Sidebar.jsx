import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  KanbanSquare, 
  CalendarDays, 
  FileText, 
  GitFork, 
  Database, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { logout, user } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracker', name: 'Kanban Tracker', icon: KanbanSquare },
    { id: 'calendar', name: 'Placement Calendar', icon: CalendarDays },
    { id: 'resumes', name: 'Resume Manager', icon: FileText },
    { id: 'roadmaps', name: 'Prep Roadmaps', icon: GitFork },
    { id: 'experiences', name: 'Interview Hub', icon: Database }
  ];

  return (
    <aside className="glass-panel" style={{
      width: '280px',
      height: 'calc(100vh - 40px)',
      position: 'sticky',
      top: '20px',
      left: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '30px'
    }}>
      {/* Brand logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 8px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #ffffff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Smart Placement Tracker</h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Placement Tracker</span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1
      }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderRadius: '10px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User profile section at the bottom */}
      <div style={{
        borderTop: '1px solid var(--border-light)',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div 
          onClick={() => setCurrentPage('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <User size={18} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user ? user.name : 'Student Profile'}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user ? user.dreamCompany : 'Not Configured'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontFamily: 'var(--font-display)',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            justifyContent: 'center',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.15)';
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
