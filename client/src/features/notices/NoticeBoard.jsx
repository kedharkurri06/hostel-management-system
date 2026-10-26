import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PlusIcon } from '../../components/common/Icons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const NoticeBoard = ({ onOpenNoticeModal }) => {
  const { role, hasWardenPrivileges } = useAuth();
  const { addToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.notices.getAll();
      if (res.success && res.data) {
        setNotices(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.notices.delete(id);
      addToast('Notice deleted successfully', 'success');
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      addToast(err.message || 'Failed to delete notice', 'info');
    }
  };

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
            Hostel Notice Board & Circulars
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Official announcements regarding water cleaning, power maintenance, and mess updates.
          </p>
        </div>
        <button onClick={onOpenNoticeModal} className="btn btn-primary">
          <PlusIcon /> Post Official Circular
        </button>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading notices...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : notices.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No Circulars Posted</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>There are currently no active announcements.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {notices.map(n => {
            const isUrgent = n.priority === 'High';
            return (
              <div
                key={n._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: isUrgent ? '4px solid #ef4444' : '4px solid var(--accent-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.72rem' }}>
                      {n.category}
                    </span>
                    {isUrgent && (
                      <span className="badge badge-emergency" style={{ fontSize: '0.68rem' }}>
                        URGENT NOTICE
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📅 {n.date || (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent')}
                    </div>
                    {(role === 'warden' || hasWardenPrivileges) && (
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                        title="Delete notice"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  {n.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {n.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
