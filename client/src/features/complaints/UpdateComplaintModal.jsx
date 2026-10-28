import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const UpdateComplaintModal = ({ isOpen, onClose, complaint, onComplaintUpdated }) => {
  const { addToast } = useToast();
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'Pending');
      setAssignedTo(complaint.assignedTo || '');
      setResolutionNotes(complaint.resolutionNotes || '');
    }
  }, [complaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint) return;

    setSubmitting(true);
    try {
      const res = await api.complaints.update(complaint._id, {
        status,
        assignedTo,
        resolutionNotes
      });
      if (res.success && res.data) {
        addToast(`Ticket #${complaint.ticketId} status updated to ${status}`, 'success', 3000, 'Ticket Updated');
        onComplaintUpdated(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update ticket. (Warden authorization required)', 'error', 3500, 'Update Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 style={{
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-serif)',
        color: 'var(--foreground)'
      }}>
        Update Ticket #{complaint?.ticketId} (Room {complaint?.roomNo})
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
        Change complaint progress status, assign a maintenance staff member, and record resolution details.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Complaint Status
          </label>
          <select
            className="select-field"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Pending">Pending (Not Dispatched)</option>
            <option value="In Progress">In Progress (Technician Dispatched)</option>
            <option value="Resolved">Resolved (Work Completed)</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Assigned Technician / Staff Member
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Ramesh Kumar (HVAC Tech)"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Resolution Notes / Progress Details
          </label>
          <textarea
            className="textarea-field"
            rows="3"
            placeholder="Enter details of repair done or expected completion time..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateComplaintModal;
