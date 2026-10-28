import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const ReviewGatePassModal = ({ isOpen, onClose, gatePass, onReviewed }) => {
  const { addToast } = useToast();
  const [status, setStatus] = useState('Approved');
  const [wardenRemarks, setWardenRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gatePass) return;
    setSubmitting(true);
    try {
      const res = await api.gatePasses.review(gatePass._id, { status, wardenRemarks });
      if (res.success) {
        addToast(`Gate Pass #${gatePass.passId} ${status.toLowerCase()} successfully.`, 'success');
        onReviewed && onReviewed(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update gate pass. Warden authorization required.', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge" style={{ background: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)', marginBottom: '0.4rem' }}>
            Warden Review
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}>
            Review Gate Pass #{gatePass?.passId}
          </h2>
        </div>
        <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}>✕</button>
      </div>

      {/* Application Summary */}
      {gatePass && (
        <div style={{
          background: 'var(--muted)',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          marginBottom: '1.25rem',
          border: '1px solid var(--border)',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
            <div><strong style={{ color: 'var(--foreground)' }}>Student:</strong> {gatePass.studentName}</div>
            <div><strong style={{ color: 'var(--foreground)' }}>Room:</strong> {gatePass.roomNo} – {gatePass.block}</div>
            <div><strong style={{ color: 'var(--foreground)' }}>Type:</strong> {gatePass.type}</div>
            <div><strong style={{ color: 'var(--foreground)' }}>Phone:</strong> {gatePass.phone}</div>
            <div><strong style={{ color: 'var(--foreground)' }}>Destination:</strong> {gatePass.destination}</div>
            <div><strong style={{ color: 'var(--foreground)' }}>Dates:</strong> {gatePass.outDate} → {gatePass.returnDate}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--foreground)' }}>Purpose:</strong> {gatePass.purpose}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Decision *</label>
          <select className="select-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Approved">✅ Approved – Grant Pass</option>
            <option value="Rejected">❌ Rejected – Deny Pass</option>
            <option value="Pending">⏳ Keep Pending – Review Later</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Warden Remarks / Reason</label>
          <textarea
            className="textarea-field"
            rows="3"
            placeholder="e.g. Approved. Return by 9 PM on return date. / Rejected: Exam season, pass denied."
            value={wardenRemarks}
            onChange={(e) => setWardenRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ background: status === 'Rejected' ? 'var(--destructive)' : undefined }}
          >
            {submitting ? 'Saving...' : (status === 'Approved' ? 'Approve Pass' : status === 'Rejected' ? 'Reject Pass' : 'Save Decision')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewGatePassModal;
