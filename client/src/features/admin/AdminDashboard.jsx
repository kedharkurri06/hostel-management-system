import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { PlusIcon } from '../../components/common/Icons';
import NoticeModal from '../notices/NoticeModal';

export const AdminDashboard = ({
  stats,
  complaints = [],
  onSetComplaintFilter,
  onOpenUpdateComplaintModal,
  onNavigate
}) => {
  const { addToast, confirmDialog } = useToast();
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      const res = await api.notices.getAll();
      if (res.success && res.data) {
        setNotices(res.data);
      }
    } catch (err) {
      console.error('Failed to load notices on admin dashboard:', err.message);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleNoticeCreated = (newNotice) => {
    if (newNotice) {
      setNotices(prev => [newNotice, ...prev]);
    }
    fetchNotices();
  };

  const handleDeleteNotice = async (n) => {
    const id = n._id || n.id;
    const title = n.title || 'this notice';
    const confirmed = await confirmDialog({
      title: 'Delete Notice Circular?',
      message: `Are you sure you want to delete "${title}"? This circular will be permanently removed for all hostel residents.`,
      confirmText: 'Delete Circular',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.notices.delete(id);
      addToast('Notice circular deleted successfully.', 'success', 3000, 'Notice Deleted');
      setNotices(prev => prev.filter(item => (item._id !== id && item.id !== id)));
    } catch (err) {
      addToast(err.message || 'Failed to delete notice circular.', 'error', 3500, 'Action Failed');
    }
  };
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

      {/* Hostel Notice Board & Circulars Section */}
      <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              margin: 0,
              fontFamily: 'var(--font-serif)',
              color: 'var(--foreground)'
            }}>
              Hostel Notice Board &amp; Circulars
            </h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
              Broadcast urgent maintenance alerts, mess changes, or rules directly to residents
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('notices')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem' }}
              >
                View Public Board →
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsNoticeModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
            >
              <PlusIcon /> Post New Notice
            </button>
          </div>
        </div>

        {loadingNotices ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
            Loading active circulars...
          </div>
        ) : notices.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--muted-foreground)', border: '1px dashed var(--border)' }}>
            <h4 style={{ margin: 0, color: 'var(--foreground)', fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>No Active Circulars</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.3rem', marginBottom: '1rem' }}>
              All mock notices have been cleared. Post a new circular to announce maintenance or rules.
            </p>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              + Create First Notice
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notices.map(n => {
              const isUrgent = n.priority === 'High';
              return (
                <div
                  key={n._id || n.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: isUrgent ? '4px solid var(--destructive)' : '4px solid var(--sidebar-primary)',
                    borderRadius: 'var(--radius)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{
                        background: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        border: '1px solid var(--border)',
                        fontSize: '0.72rem'
                      }}>
                        {n.category}
                      </span>
                      {isUrgent && (
                        <span className="badge badge-emergency" style={{ fontSize: '0.68rem' }}>
                          URGENT
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--muted-foreground)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        📅 {n.date || (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent')}
                      </div>
                      <button
                        onClick={() => handleDeleteNotice(n)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', color: 'var(--destructive)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        title="Delete notice circular"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <h4 style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    margin: '0 0 0.35rem 0',
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--foreground)'
                  }}>
                    {n.title}
                  </h4>
                  <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.5,
                    margin: 0
                  }}>
                    {n.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Embedded Notice Modal */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onNoticeCreated={handleNoticeCreated}
      />
    </div>
  );
};

export default AdminDashboard;
