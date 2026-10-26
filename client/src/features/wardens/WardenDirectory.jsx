import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PhoneIcon } from '../../components/common/Icons';

export const WardenDirectory = () => {
  const [wardens, setWardens] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchWardens();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading wardens & staff directory...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
          Warden & Administration Contacts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Official contact directory for campus wardens, hostel officers, and 24/7 maintenance desks.
        </p>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        Hostel Wardens Directory
      </h3>
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {wardens.map(w => (
          <div
            key={w._id || w.wardenId}
            className="glass-card"
            style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
          >
            <img
              src={w.avatar}
              alt={w.name}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.72rem' }}>
                  {w.block}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ID: {w.wardenId?.toUpperCase()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{w.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
                {w.role}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <div>📍 {w.office}</div>
                <div>🕒 {w.hours}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <a href={`tel:${w.phone}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.78rem' }}>
                  <PhoneIcon /> Call {w.phone}
                </a>
                <a href={`mailto:${w.email}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
                  Email
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        Essential Maintenance & Emergency Technicians
      </h3>
      <div className="grid-3">
        {staff.map((st, idx) => (
          <div key={st._id || idx} className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{st.name}</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {st.designation}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Availability: <strong style={{ color: 'var(--accent-success)' }}>{st.availability}</strong>
            </div>
            <a
              href={`tel:${st.phone}`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
            >
              <PhoneIcon /> Call {st.phone}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardenDirectory;
