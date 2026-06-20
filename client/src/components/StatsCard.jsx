import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'var(--color-primary)', subtitle = '' }) => {
  return (
    <div className="glass-panel" style={{
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flex: 1,
      minWidth: '220px'
    }}>
      <div style={{
        background: `rgba(${color === 'var(--color-primary)' ? '99, 102, 241' : color === 'var(--color-success)' ? '16, 185, 129' : color === 'var(--color-warning)' ? '245, 158, 11' : '14, 165, 233'}, 0.12)`,
        border: `1px solid rgba(${color === 'var(--color-primary)' ? '99, 102, 241' : color === 'var(--color-success)' ? '16, 185, 129' : color === 'var(--color-warning)' ? '245, 158, 11' : '14, 165, 233'}, 0.25)`,
        width: '52px',
        height: '52px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</span>
        <h3 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          fontFamily: 'var(--font-display)',
          lineHeight: '1',
          letterSpacing: '-0.02em'
        }}>{value}</h3>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subtitle}</span>}
      </div>
    </div>
  );
};

export default StatsCard;
