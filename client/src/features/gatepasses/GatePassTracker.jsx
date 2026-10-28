import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import GatePassModal from './GatePassModal';
import ReviewGatePassModal from './ReviewGatePassModal';

const STATUS_COLORS = {
  Pending: { bg: 'rgba(217,119,6,0.12)', color: '#92400E', border: 'rgba(217,119,6,0.3)' },
  Approved: { bg: 'rgba(5,150,105,0.12)', color: '#065F46', border: 'rgba(5,150,105,0.3)' },
  Rejected: { bg: 'rgba(220,38,38,0.1)', color: '#991B1B', border: 'rgba(220,38,38,0.25)' }
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return (
    <span style={{
      padding: '0.25rem 0.7rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.02em'
    }}>
    </span>
  );
};

export const GatePassTracker = ({ onOpenGatePassModal }) => {
  const { role, isAuthenticated, user } = useAuth();
  const { addToast, confirmDialog } = useToast();
  const isWarden = role === 'warden';

  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [reviewingPass, setReviewingPass] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchPasses = useCallback(async () => {
    if (!isAuthenticated) {
      setPasses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'All') params.status = filterStatus;
      if (search) params.search = search;
      params.limit = 50;
      const res = await api.gatePasses.getAll(params);
      if (res.success && res.data) {
        setPasses(res.data);
      }
    } catch (err) {
      console.error('Failed to load gate passes:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filterStatus, search]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  const handleDeletePass = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete Gate Pass?',
      message: 'Are you sure you want to delete this gate pass record? This action cannot be undone.',
      confirmText: 'Delete Record',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      await api.gatePasses.delete(id);
      addToast('Gate pass deleted.', 'success', 3000, 'Pass Deleted');
      fetchPasses();
    } catch (err) {
      addToast('Failed to delete gate pass.', 'error', 3500, 'Action Failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
          Sign In Required
        </h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
          Please sign in to view and manage gate passes.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}>
            {isWarden ? 'Gate Pass Management' : 'My Gate Passes'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {isWarden
              ? 'Review and approve/reject student outpass applications.'
              : 'Apply for gate passes and track their approval status.'}
          </p>
        </div>
        {!isWarden && (
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            + Apply for Gate Pass
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid var(--border)' }}>
        <input
          type="text"
          className="input-field"
          style={{ maxWidth: '300px', flex: '1 1 180px' }}
          placeholder="Search by name, pass ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          Loading gate passes...
        </div>
      ) : passes.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No gate passes found</div>
          {!isWarden && (
            <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
              Apply for First Pass
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {passes.map(pass => (
            <div
              key={pass._id || pass.passId}
              className="card"
              style={{ padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}
            >
              {/* Left: Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: 'var(--sidebar-primary)',
                    fontSize: '0.9rem'
                  }}>
                    #{pass.passId}
                  </span>
                  <StatusBadge status={pass.status} />
                  <span style={{
                    fontSize: '0.72rem',
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border)'
                  }}>
                    {pass.type}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                  {pass.studentName}
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>🏠 Room {pass.roomNo} ({pass.block})</span>
                  <span>📅 {pass.outDate} → {pass.returnDate}</span>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                  📍 <strong style={{ color: 'var(--foreground)' }}>{pass.destination}</strong>
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--muted-foreground)', marginTop: '0.15rem' }}>
                  📝 {pass.purpose}
                </div>
                {pass.wardenRemarks && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    background: pass.status === 'Approved'
                      ? 'rgba(5,150,105,0.08)'
                      : pass.status === 'Rejected'
                        ? 'rgba(220,38,38,0.07)'
                        : 'var(--muted)',
                    fontSize: '0.8rem',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }}>
                    <strong>Warden's Remarks:</strong> {pass.wardenRemarks}
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              {isWarden && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setReviewingPass(pass); setIsReviewModalOpen(true); }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleDeletePass(pass._id)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', color: 'var(--destructive)' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <GatePassModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onGatePassCreated={fetchPasses}
      />
      <ReviewGatePassModal
        isOpen={isReviewModalOpen}
        onClose={() => { setIsReviewModalOpen(false); setReviewingPass(null); }}
        gatePass={reviewingPass}
        onReviewed={fetchPasses}
      />
    </div>
  );
};

export default GatePassTracker;
