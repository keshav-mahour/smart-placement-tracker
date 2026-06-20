import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ pageTitle }) => {
  const { user } = useContext(AuthContext);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 40px',
      borderBottom: '1px solid var(--border-light)'
    }}>
      <div>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em'
        }}>{pageTitle}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Welcome back, {user ? user.name : 'Student'}</p>
      </div>
    </header>
  );
};

export default Navbar;
