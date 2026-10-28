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

      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '1rem',
        fontFamily: 'var(--font-serif)',
        color: 'var(--foreground)'
      }}>
        Hostel Wardens Directory
      </h3>
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {wardens.map(w => (
          <div
            key={w._id || w.wardenId}
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              gap: '1.25rem',
              alignItems: 'flex-start',
              border: '1px solid var(--border)'
            }}
          >
            <img
              src={w.avatar}
              alt={w.name}
              style={{
                width: '74px',
                height: '74px',
                borderRadius: 'var(--radius)',
                objectFit: 'cover',
                border: '2px solid var(--primary)',
                background: 'var(--muted)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
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

      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '1rem',
        fontFamily: 'var(--font-serif)',
        color: 'var(--foreground)'
      }}>
        Essential Maintenance &amp; Emergency Technicians
      </h3>
      <div className="grid-3">
        {staff.map((st, idx) => (
          <div key={st._id || idx} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
            <h4 style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'var(--font-serif)',
              color: 'var(--foreground)'
            }}>
              {st.name}
            </h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
              {st.designation}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.85rem' }}>
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
