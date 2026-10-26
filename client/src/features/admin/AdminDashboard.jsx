import React from 'react';

export const AdminDashboard = ({
  stats,
  complaints = [],
  onSetComplaintFilter,
  onOpenUpdateComplaintModal
}) => {
  const {
    total = 0,
    pending = 0,
    emergency = 0,
    resolutionRate = 0
  } = stats || {};

  const activeQueue = complaints.filter(c => c.status !== 'Resolved');

  return (
    <div>
      <div className="glass-card" style={{
        padding: '1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge" style={{ background: 'var(--accent-success)', color: '#ffffff' }}>
            Warden Administration Portal
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0 0' }}>
            Hostel Operations & Maintenance Control
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Monitor complaint resolution velocity, dispatch technicians, and manage mess menus.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {resolutionRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Overall Resolution Speed
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Pending Dispatch Queue
        </h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          There are currently <strong style={{ color: 'var(--accent-warning)' }}>{pending} unassigned tickets</strong> and <strong style={{ color: '#ef4444' }}>{emergency} emergency requests</strong> requiring staff assignment.
        </div>
        <button
          onClick={() => onSetComplaintFilter('Pending')}
          className="btn btn-primary"
        >
          Dispatch Staff to Pending ({pending})
        </button>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
        Unassigned / Active Complaint Queue
      </h3>
      <div className="glass-card" style={{ overflowX: 'auto' }}>
        {activeQueue.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            All complaints are resolved! No pending or in-progress tickets.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Ticket ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Room & Block</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Resident Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeQueue.map(c => (
                <tr key={c._id || c.ticketId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>{c.ticketId || c.id}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>Room {c.roomNo} ({c.block})</td>
                  <td style={{ padding: '0.85rem 1rem' }}>{c.category}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`priority-tag priority-${c.priority}`}>{c.priority}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{c.studentName} ({c.phone})</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`badge ${c.status === 'Pending' ? 'badge-pending' : 'badge-in-progress'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <button
                      onClick={() => onOpenUpdateComplaintModal(c)}
                      className="btn btn-secondary btn-sm"
                    >
                      Assign & Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
