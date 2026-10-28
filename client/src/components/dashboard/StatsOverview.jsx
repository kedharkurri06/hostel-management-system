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
    {
      title: 'Total Complaints',
      count: total,
      color: 'var(--primary)',
      key: 'All',
      subtitle: 'Recorded issues',
      icon: '📊'
    },
    {
      title: 'Active Pending',
      count: pending,
      color: 'var(--accent-warning)',
      key: 'Pending',
      subtitle: 'Awaiting assignment',
      icon: '⏳'
    },
    {
      title: 'In Progress',
      count: inProgress,
      color: 'var(--sidebar-primary)',
      key: 'In Progress',
      subtitle: 'Technician dispatched',
      icon: '🔧'
    },
    {
      title: 'Resolved',
      count: resolved,
      color: 'var(--accent-success)',
      key: 'Resolved',
      subtitle: `${resolutionRate}% resolution rate`,
      icon: '✅'
    }
  ];

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Emergency Alert Banner */}
      {emergency > 0 && (
        <div className="card" style={{
          background: 'rgba(153, 27, 27, 0.06)',
          borderColor: 'rgba(153, 27, 27, 0.2)',
          borderLeft: '4px solid var(--destructive)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--destructive)',
              fontFamily: 'var(--font-sans)'
            }}>
              🔥 {emergency} Emergency Complaint{emergency > 1 ? 's' : ''} Require Immediate Attention!
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              High-priority issues like major pipe bursts or electrical hazards flagged for urgent dispatch.
            </p>
          </div>
          <button
            onClick={() => onSelectFilter('Emergency')}
            className="btn btn-sm"
            style={{
              background: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              border: 'none',
              fontWeight: 700
            }}
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
            className="card card-interactive"
            onClick={() => onSelectFilter(c.key)}
            style={{
              padding: '1.15rem',
              borderLeft: `3px solid ${c.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div>
              <span style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em'
              }}>
                {c.title}
              </span>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                margin: '0.15rem 0',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)'
              }}>
                {c.count}
              </h2>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)'
              }}>
                {c.subtitle}
              </span>
            </div>
            <div style={{
              fontSize: '1.5rem',
              opacity: 0.7
            }}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsOverview;
