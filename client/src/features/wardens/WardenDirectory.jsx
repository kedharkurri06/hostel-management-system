import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PhoneIcon } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import WardenModal from './WardenModal';
import StaffModal from './StaffModal';

export const WardenDirectory = () => {
  const { role, hasWardenPrivileges } = useAuth();
  const { addToast } = useToast();
  const isWarden = role === 'warden' || hasWardenPrivileges;

  const [wardens, setWardens] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Warden Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarden, setEditingWarden] = useState(null);

  // Staff / Technician Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const fetchWardens = async () => {
    try {
      setLoading(true);
      const res = await api.wardens.get();
      if (res.success && res.data) {
        setWardens(res.data.wardens || []);
        setStaff(res.data.staff || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wardens directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardens();
  }, []);

  const handleOpenAddModal = () => {
    setEditingWarden(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (w) => {
    setEditingWarden(w);
    setIsModalOpen(true);
  };

  const handleDeleteWarden = async (w) => {
    if (!window.confirm(`Are you sure you want to remove "${w.name}" from the hostel warden directory?`)) {
      return;
    }

    try {
      const id = w._id || w.wardenId;
      await api.wardens.delete(id);
      addToast(`Warden profile for "${w.name}" has been removed.`, 'success', 3000, 'Warden Removed');
      setWardens(prev => prev.filter(item => (item._id || item.wardenId) !== id));
    } catch (err) {
      addToast(err.message || 'Failed to remove warden. Authorization required.', 'error', 3500, 'Action Failed');
    }
  };

  const handleOpenAddStaffModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaffModal = (st) => {
    setEditingStaff(st);
    setIsStaffModalOpen(true);
  };

  const handleDeleteStaff = async (st) => {
    if (!window.confirm(`Are you sure you want to remove technician "${st.name}" (${st.designation}) from the directory?`)) {
      return;
    }

    try {
      await api.wardens.deleteStaff(st._id);
      addToast(`Technician "${st.name}" has been removed.`, 'success', 3000, 'Technician Removed');
      setStaff(prev => prev.filter(item => item._id !== st._id));
    } catch (err) {
      addToast(err.message || 'Failed to remove technician. Authorization required.', 'error', 3500, 'Action Failed');
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
        Loading wardens &amp; staff directory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--destructive)' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          margin: 0,
          fontFamily: 'var(--font-serif)',
          color: 'var(--foreground)'
        }}>
          Warden &amp; Administration Contacts
        </h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Official contact directory for campus wardens, hostel officers, and 24/7 maintenance desks.
        </p>
      </div>

      {/* Wardens Header with Action for Warden Role */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          margin: 0,
          fontFamily: 'var(--font-serif)',
          color: 'var(--foreground)'
        }}>
          Hostel Wardens Directory
        </h3>
        {isWarden && (
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            + Add New Warden
          </button>
        )}
      </div>

      {/* Wardens Grid */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {wardens.map(w => (
          <div
            key={w._id || w.wardenId}
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              border: '1px solid var(--border)',
              flexWrap: 'wrap',
              background: 'var(--card)'
            }}
          >
            {/* Avatar with fallback */}
            {w.avatar ? (
              <img
                src={w.avatar}
                alt={w.name}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--radius)',
                  objectFit: 'cover',
                  border: '2px solid var(--primary)',
                  background: 'var(--muted)',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius)',
                background: 'var(--sidebar-primary)',
                color: '#ffffff',
                display: w.avatar ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                flexShrink: 0
              }}
            >
              {w.name ? w.name.trim().charAt(0).toUpperCase() : 'W'}
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <span className="badge" style={{
                  background: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  fontSize: '0.72rem',
                  border: '1px solid var(--border)'
                }}>
                  {w.block}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  ID: {w.wardenId?.toUpperCase()}
                </span>
              </div>

              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                margin: 0,
                fontFamily: 'var(--font-serif)',
                color: 'var(--foreground)'
              }}>
                {w.name}
              </h3>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
                marginBottom: '0.75rem'
              }}>
                {w.role}
              </div>

              <div style={{
                fontSize: '0.83rem',
                color: 'var(--muted-foreground)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '1rem'
              }}>
                <div>📍 {w.office || 'Hostel Warden Office'}</div>
                <div>🕒 {w.hours || '9:00 AM - 5:00 PM'}</div>
              </div>

              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                borderTop: isWarden ? '1px solid var(--border)' : 'none',
                paddingTop: isWarden ? '0.75rem' : 0
              }}>
                <a href={`tel:${w.phone}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.78rem' }}>
                  <PhoneIcon /> Call {w.phone}
                </a>
                <a href={`mailto:${w.email}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                  Email
                </a>
                {isWarden && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(w)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                      title="Edit warden details"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWarden(w)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', color: 'var(--destructive)' }}
                      title="Remove warden from directory"
                    >
                      🗑️ Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Essential Maintenance & Emergency Technicians */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            Essential Maintenance &amp; Emergency Technicians
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--muted-foreground)',
            margin: '0.2rem 0 0 0'
          }}>
            On-call duty technicians and facility emergency response personnel
          </p>
        </div>

        {isWarden && (
          <button
            onClick={handleOpenAddStaffModal}
            className="btn btn-primary"
            style={{
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 0.9rem'
            }}
            title="Add a new emergency maintenance contact"
          >
            + Add Technician
          </button>
        )}
      </div>

      <div className="grid-3">
        {staff.map((st, idx) => (
          <div
            key={st._id || idx}
            className="card"
            style={{
              padding: '1.25rem',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <h4 style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--foreground)'
                }}>
                  {st.name}
                </h4>
                <span className="badge" style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.45rem',
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)'
                }}>
                  Staff
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                {st.designation}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                Availability: <strong style={{ color: 'var(--accent-foreground)' }}>{st.availability}</strong>
              </div>
            </div>

            <div>
              <a
                href={`tel:${st.phone}`}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '0.82rem',
                  marginBottom: isWarden ? '0.5rem' : '0'
                }}
              >
                <PhoneIcon /> Call {st.phone}
              </a>

              {/* Warden-Only Edit & Delete Actions */}
              {isWarden && (
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEditStaffModal(st)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                    title="Edit technician details"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(st)}
                    className="btn btn-secondary btn-sm"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.5rem',
                      color: 'var(--destructive)',
                      borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}
                    title="Remove technician"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Warden Edit / Add Modal */}
      <WardenModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarden(null);
        }}
        warden={editingWarden}
        onSaved={fetchWardens}
      />

      {/* Staff / Technician Edit / Add Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaff(null);
        }}
        staff={editingStaff}
        onSaved={fetchWardens}
      />
    </div>
  );
};

export default WardenDirectory;
