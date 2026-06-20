import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Calendar from './pages/Calendar';
import ResumeManager from './pages/ResumeManager';
import PrepRoadmaps from './pages/PrepRoadmaps';
import InterviewRepository from './pages/InterviewRepository';
import Profile from './pages/Profile';

const AppContent = () => {
  const { token, loading } = useContext(AuthContext);
  
  // Navigation states
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        <p>Initializing placement portal...</p>
      </div>
    );
  }

  // Auth Guard
  if (!token) {
    return authScreen === 'login' ? (
      <Login onRegisterRedirect={() => setAuthScreen('register')} />
    ) : (
      <Register onLoginRedirect={() => setAuthScreen('login')} />
    );
  }

  // Page title mapper
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'tracker': return 'Application Kanban Board';
      case 'calendar': return 'Placement Calendar';
      case 'resumes': return 'Resume Manager & ATS Analyzer';
      case 'roadmaps': return 'AI Interview Prep Roadmaps';
      case 'experiences': return 'Interview Experience Repository';
      case 'profile': return 'Profile Settings';
      default: return 'Student Portal';
    }
  };

  // Page renderer
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'tracker': return <Tracker />;
      case 'calendar': return <Calendar />;
      case 'resumes': return <ResumeManager />;
      case 'roadmaps': return <PrepRoadmaps />;
      case 'experiences': return <InterviewRepository />;
      case 'profile': return <Profile />;
      default: return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px 20px 20px 0',
      gap: '20px',
      overflow: 'hidden'
    }}>
      {/* Sidebar navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main content body */}
      <main style={{
        flex: 1,
        height: 'calc(100vh - 40px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }} className="glass-panel">
        <Navbar pageTitle={getPageTitle()} setCurrentPage={setCurrentPage} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
