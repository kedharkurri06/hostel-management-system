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
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            Room Maintenance & Complaints
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Real-time status tracking for AC, plumbing, electrical, and facility issues.
          </p>
        </div>
        <button onClick={onOpenComplaintModal} className="btn btn-primary">
          <PlusIcon /> Register New Complaint
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '8px' }}
                >
                  <span>{s}</span>
                  <span style={{
                    background: isActive ? '#ffffff' : 'var(--glass-border)',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, maxWidth: '500px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search room no, ticket ID, name..."
              style={{ fontSize: '0.85rem', flex: 1 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="select-field"
              style={{ width: 'auto', fontSize: '0.85rem' }}
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
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading complaints...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No Complaints Found</h3>
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
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: isEmergency && item.status !== 'Resolved' ? '4px solid #ef4444' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {item.ticketId || item.id}
                      </span>
                      <span className={`priority-tag priority-${item.priority}`}>
                        {item.priority}
                      </span>
                    </div>
                    <span className={`badge ${badgeClass}`}>{item.status}</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                    Room {item.roomNo} &bull; {item.block}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Category: <strong>{item.category}</strong>
                  </span>

                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-secondary)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    margin: '0.75rem 0 1rem 0',
                    lineHeight: 1.45
                  }}>
                    {item.description}
                  </p>

                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Resident:</span> <strong>{item.studentName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Contact:</span> <strong>{item.phone}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Time Slot:</span> <strong>{item.visitTimeSlot}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Filed:</span> <strong>{createdDate}</strong>
                    </div>
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px dashed rgba(99, 102, 241, 0.25)',
                    fontSize: '0.82rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                      Assigned Staff: {item.assignedTo || 'Pending Dispatch'}
                    </div>
                    {item.resolutionNotes && (
                      <div style={{ color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                        <strong>Resolution Note:</strong> {item.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--glass-border)',
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
