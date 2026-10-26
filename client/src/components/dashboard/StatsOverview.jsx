import React from 'react';

export const StatsOverview = ({ stats, onSelectFilter }) => {
  const {
    total = 0,
    pending = 0,
    inProgress = 0,
    resolved = 0,
    emergency = 0
  } = stats || {};

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const cards = [
    { title: 'Total Complaints', count: total, color: 'var(--accent-primary)', key: 'All', subtitle: 'Recorded issues' },
    { title: 'Active Pending', count: pending, color: 'var(--accent-warning)', key: 'Pending', subtitle: 'Awaiting assignment' },
    { title: 'In Progress', count: inProgress, color: 'var(--accent-secondary)', key: 'In Progress', subtitle: 'Technician dispatched' },
    { title: 'Resolved', count: resolved, color: 'var(--accent-success)', key: 'Resolved', subtitle: `${resolutionRate}% resolution rate` }
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Emergency Alert Banner */}
      {emergency > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(185, 28, 28, 0.4))',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          color: '#fca5a5',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.2)'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              🔥 {emergency} Emergency Complaint{emergency > 1 ? 's' : ''} Require Immediate Attention!
            </h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#fca5a5' }}>
              High-priority issues like major pipe bursts or electrical hazards flagged for urgent dispatch.
            </p>
          </div>
          <button
            onClick={() => onSelectFilter('Emergency')}
            className="btn btn-sm"
            style={{ background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: 700 }}
          >
            View Urgent
          </button>
        </div>
      )}

      {/* Grid of 4 Metric Cards */}
      <div className="grid-4">
        {cards.map(c => (
          <div
            key={c.key}
            className="glass-card"
            onClick={() => onSelectFilter(c.key)}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: `4px solid ${c.color}`
            }}
          >
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {c.title}
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.2rem 0', color: 'var(--text-primary)' }}>
                {c.count}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {c.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;
