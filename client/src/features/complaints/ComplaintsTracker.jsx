import React, { useState } from 'react';
import { PlusIcon, PhoneIcon } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';

export const ComplaintsTracker = ({
  complaints = [],
  selectedFilter = 'All',
  onSelectFilter,
  onOpenComplaintModal,
  onOpenUpdateComplaintModal,
  loading = false
}) => {
  const { role, hasWardenPrivileges } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = complaints.filter(item => {
    if (selectedFilter === 'Pending' && item.status !== 'Pending') return false;
    if (selectedFilter === 'In Progress' && item.status !== 'In Progress') return false;
    if (selectedFilter === 'Resolved' && item.status !== 'Resolved') return false;
    if (selectedFilter === 'Emergency' && item.priority !== 'Emergency') return false;

    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (item.ticketId || item.id || '').toLowerCase().includes(q);
      const matchRoom = (item.roomNo || '').toLowerCase().includes(q);
      const matchName = (item.studentName || '').toLowerCase().includes(q);
      const matchBlock = (item.block || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchId && !matchRoom && !matchName && !matchBlock && !matchDesc) return false;
    }

    return true;
  });

  const filterKeys = ['All', 'Pending', 'In Progress', 'Resolved', 'Emergency'];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            Room Maintenance &amp; Complaints
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Real-time status tracking for AC, plumbing, electrical, and campus hostel facilities.
          </p>
        </div>
        <button onClick={onOpenComplaintModal} className="btn btn-primary">
          <PlusIcon /> Register New Complaint
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {filterKeys.map(s => {
              const isActive = selectedFilter === s;
              const count = s === 'All'
                ? complaints.length
                : s === 'Emergency'
                  ? complaints.filter(c => c.priority === 'Emergency').length
                  : complaints.filter(c => c.status === s).length;

              return (
                <button
                  key={s}
                  onClick={() => onSelectFilter(s)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  <span>{s}</span>
                  <span style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--border)',
                    color: isActive ? '#ffffff' : 'var(--foreground)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            flex: '1 1 280px',
            maxWidth: '520px'
          }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search room no, ticket ID, name..."
              style={{ fontSize: '0.85rem', flex: '1 1 160px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="select-field"
              style={{ width: 'auto', minWidth: '130px', flex: '1 1 120px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="AC">AC / HVAC</option>
              <option value="Water">Plumbing / Water</option>
              <option value="Electrical">Electrical</option>
              <option value="Wi-Fi">Wi-Fi / Network</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Furniture">Furniture</option>
              <option value="Pest Control">Pest Control</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          Loading complaints...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          <h3 style={{ margin: 0, color: 'var(--foreground)', fontFamily: 'var(--font-serif)' }}>No Complaints Found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
            There are no room complaints matching your selected criteria.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(item => {
            const isEmergency = item.priority === 'Emergency';
            let badgeClass = 'badge-pending';
            if (item.status === 'In Progress') badgeClass = 'badge-in-progress';
            if (item.status === 'Resolved') badgeClass = 'badge-resolved';
            if (isEmergency && item.status !== 'Resolved') badgeClass = 'badge-emergency';

            const createdDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : 'Recent';

            return (
              <div
                key={item._id || item.ticketId}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isEmergency && item.status !== 'Resolved'
                    ? '4px solid var(--destructive)'
                    : '4px solid var(--border)'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--sidebar-primary)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        #{item.ticketId || item.id}
                      </span>
                      <span className={`priority-tag priority-${item.priority}`}>
                        {item.priority}
                      </span>
                    </div>
                    <span className={`badge ${badgeClass}`}>{item.status}</span>
                  </div>

                  <h3 style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--foreground)'
                  }}>
                    Room {item.roomNo} &bull; {item.block}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                    Category: <strong style={{ color: 'var(--foreground)' }}>{item.category}</strong>
                  </div>

                  <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--card-foreground)',
                    background: 'var(--muted)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    margin: '0.75rem 0 1rem 0',
                    lineHeight: 1.45,
                    border: '1px solid var(--border)'
                  }}>
                    {item.description}
                  </p>

                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--muted-foreground)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span>Resident:</span> <strong style={{ color: 'var(--foreground)' }}>{item.studentName}</strong>
                    </div>
                    <div>
                      <span>Contact:</span> <strong style={{ color: 'var(--foreground)' }}>{item.phone}</strong>
                    </div>
                    <div>
                      <span>Time Slot:</span> <strong style={{ color: 'var(--foreground)' }}>{item.visitTimeSlot}</strong>
                    </div>
                    <div>
                      <span>Filed:</span> <strong style={{ color: 'var(--foreground)' }}>{createdDate}</strong>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--secondary)',
                    border: '1px solid var(--border)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: 'var(--secondary-foreground)', fontWeight: 700 }}>
                      Assigned Staff: {item.assignedTo || 'Pending Dispatch'}
                    </div>
                    {item.resolutionNotes && (
                      <div style={{ color: 'var(--muted-foreground)', marginTop: '0.3rem' }}>
                        <strong style={{ color: 'var(--foreground)' }}>Resolution Note:</strong> {item.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.85rem'
                }}>
                  <a href={`tel:${item.phone}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                    <PhoneIcon /> Call Resident
                  </a>

                  {(role === 'warden' || hasWardenPrivileges) ? (
                    <button
                      onClick={() => onOpenUpdateComplaintModal(item)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                    >
                      Update Status
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                      Updated by Warden
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComplaintsTracker;
