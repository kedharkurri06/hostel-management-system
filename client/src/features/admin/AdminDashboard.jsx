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
      {/* Banner */}
      <div className="card" style={{
        padding: '1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, var(--secondary) 0%, var(--card) 100%)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span className="badge" style={{
            background: 'var(--sidebar-primary)',
            color: 'var(--sidebar-primary-foreground)'
          }}>
            Warden Administration Portal
          </span>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: '0.4rem 0 0 0',
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            Hostel Operations &amp; Maintenance Control
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Monitor complaint resolution velocity, dispatch technicians, and manage mess menus.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: 'var(--sidebar-primary)',
            fontFamily: 'var(--font-mono)'
          }}>
            {resolutionRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            Overall Resolution Speed
          </div>
        </div>
      </div>

      {/* Dispatch Action Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          fontFamily: 'var(--font-serif)',
          color: 'var(--foreground)'
        }}>
          Pending Dispatch Queue
        </h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
          There are currently <strong style={{ color: 'var(--chart-4)' }}>{pending} unassigned tickets</strong> and{' '}
          <strong style={{ color: 'var(--destructive)' }}>{emergency} emergency requests</strong> requiring immediate staff assignment.
        </div>
        <button
          onClick={() => onSetComplaintFilter('Pending')}
          className="btn btn-primary"
        >
          Dispatch Staff to Pending ({pending})
        </button>
      </div>

      {/* Unassigned / Active Table */}
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: 700,
        marginBottom: '1rem',
        fontFamily: 'var(--font-serif)',
        color: 'var(--foreground)'
      }}>
        Unassigned / Active Complaint Queue
      </h3>
      <div className="card table-responsive" style={{ border: '1px solid var(--border)' }}>
        {activeQueue.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            All complaints are resolved! No pending or in-progress tickets in queue.
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                background: 'var(--muted)',
                whiteSpace: 'nowrap'
              }}>
                <th style={{ padding: '0.85rem 1rem' }}>Ticket ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Room &amp; Block</th>
                <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem' }}>Resident Contact</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeQueue.map(c => (
                <tr key={c._id || c.ticketId} style={{ borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  <td style={{
                    padding: '0.85rem 1rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--sidebar-primary)'
                  }}>
                    #{c.ticketId || c.id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--foreground)' }}>
                    Room {c.roomNo} ({c.block})
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--foreground)' }}>
                    {c.category}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span className={`priority-tag priority-${c.priority}`}>{c.priority}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--muted-foreground)' }}>
                    <strong style={{ color: 'var(--foreground)' }}>{c.studentName}</strong> ({c.phone})
                  </td>
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
                      Assign &amp; Resolve
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
