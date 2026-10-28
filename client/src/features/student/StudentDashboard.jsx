import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { WrenchIcon, UtensilsIcon, BellIcon, UsersIcon } from '../../components/common/Icons';

export const StudentDashboard = ({
  complaints = [],
  onNavigate,
  onOpenComplaintModal
}) => {
  const { user } = useAuth();

  const myComplaints = complaints;
  const pendingComplaints = myComplaints.filter(c => c.status !== 'Resolved');
  const resolvedComplaints = myComplaints.filter(c => c.status === 'Resolved');

  return (
    <div>
      {/* Student Profile Card */}
      <div className="card" style={{
        padding: '1.75rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, var(--card) 0%, var(--secondary) 100%)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: '1 1 280px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            minWidth: '56px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            flexShrink: 0
          }}>
            {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{
                background: 'var(--sidebar-primary)',
                color: 'var(--sidebar-primary-foreground)',
                fontSize: '0.72rem'
              }}>
                Verified Resident
              </span>
              <span className="badge" style={{
                background: 'rgba(5,150,105,0.15)',
                color: '#065F46',
                border: '1px solid rgba(5,150,105,0.3)',
                fontSize: '0.72rem'
              }}>
                Role: Student
              </span>
            </div>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              margin: '0.2rem 0',
              fontFamily: 'var(--font-serif)',
              color: 'var(--foreground)',
              wordBreak: 'break-word'
            }}>
              {user?.name || 'Student Resident'}
            </h2>
            <div style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.85rem',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-mono)',
              flexWrap: 'wrap'
            }}>
              <span><strong>Student ID:</strong> {user?.studentId || 'N/A'}</span>
              {user?.email && <span><strong>Email:</strong> {user.email}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenComplaintModal}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <WrenchIcon /> File Complaint
          </button>
          <button
            onClick={() => onNavigate('gatepasses')}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            Apply Gate Pass
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Complaints
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: pendingComplaints.length > 0 ? 'var(--chart-4)' : 'var(--foreground)',
            fontFamily: 'var(--font-mono)',
            margin: '0.4rem 0'
          }}>
            {pendingComplaints.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            {resolvedComplaints.length} resolved to date
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', fontWeight: 700 }}>
            Gate Passes
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)',
            margin: '0.4rem 0'
          }}>
            Portal Ready
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            Click to manage or apply
          </div>
        </div>

        <div
          className="card"
          onClick={() => onNavigate('menu')}
          style={{ padding: '1.25rem', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', fontWeight: 700 }}>
              Mess Menu
            </div>
            <UtensilsIcon />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--foreground)' }}>
            Weekly Food Schedule
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
            View Today's Meals →
          </div>
        </div>

        <div
          className="card"
          onClick={() => onNavigate('notices')}
          style={{ padding: '1.25rem', border: '1px solid var(--border)', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', fontWeight: 700 }}>
              Campus Notices
            </div>
            <BellIcon />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0.5rem 0', color: 'var(--foreground)' }}>
            Hostel Announcements
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
            Read Published Notices →
          </div>
        </div>
      </div>

      {/* Recent Personal Complaints Preview */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              margin: 0,
              fontFamily: 'var(--font-serif)',
              color: 'var(--foreground)'
            }}>
              My Registered Complaints
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Real-time maintenance status for your hostel room
            </p>
          </div>
          <button
            onClick={() => onNavigate('complaints')}
            className="btn btn-secondary btn-sm"
          >
            View All ({myComplaints.length})
          </button>
        </div>

        {myComplaints.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--muted-foreground)',
            background: 'var(--muted)',
            borderRadius: 'var(--radius)'
          }}>
            <p style={{ margin: 0 }}>No active or past complaints recorded on your account.</p>
            <button
              onClick={onOpenComplaintModal}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              Register First Complaint
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myComplaints.slice(0, 3).map(c => (
              <div
                key={c._id || c.ticketId}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius)',
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}>{c.ticketId}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>• {c.category} (Room {c.roomNo})</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--foreground)', marginTop: '0.2rem' }}>
                    {c.description}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                    background: c.status === 'Resolved' ? 'rgba(5,150,105,0.12)' : 'rgba(217,119,6,0.12)',
                    color: c.status === 'Resolved' ? '#065F46' : '#92400E'
                  }}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => onNavigate('complaints')}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

