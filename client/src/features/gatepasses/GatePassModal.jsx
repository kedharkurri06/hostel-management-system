import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const GatePassModal = ({ isOpen, onClose, onGatePassCreated }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    roomNo: '',
    block: 'Block A (Boys)',
    phone: '',
    purpose: '',
    destination: '',
    outDate: '',
    returnDate: '',
    type: 'Day Pass'
  });

  useEffect(() => {
    if (isOpen && user?.name && !formData.studentName) {
      setFormData(prev => ({ ...prev, studentName: user.name }));
    }
  }, [isOpen, user]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.gatePasses.create(formData);
      if (res.success && res.data) {
        addToast(`Gate Pass #${res.data.passId} submitted! Awaiting warden approval.`, 'success', 3000, 'Pass Applied');
        setFormData({
          studentName: '',
          roomNo: '',
          block: 'Block A (Boys)',
          phone: '',
          purpose: '',
          destination: '',
          outDate: '',
          returnDate: '',
          type: 'Day Pass'
        });
        onGatePassCreated && onGatePassCreated(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit gate pass application. Please sign in first.', 'error', 3500, 'Application Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge badge-in-progress" style={{ marginBottom: '0.4rem' }}>Gate Pass Application</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--foreground)' }}>
            Apply for Outpass / Gate Pass
          </h2>
        </div>
        <button onClick={onClose} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Resident Name *</label>
            <input
              type="text" id="studentName" className="input-field"
              placeholder="e.g. Rahul Sharma"
              value={formData.studentName} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="form-label">Mobile Number *</label>
            <input
              type="tel" id="phone" className="input-field"
              placeholder="+91 98765 43210"
              value={formData.phone} onChange={handleChange} required
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Room Number *</label>
            <input
              type="text" id="roomNo" className="input-field"
              placeholder="e.g. 304"
              value={formData.roomNo} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="form-label">Hostel Block *</label>
            <select id="block" className="select-field" value={formData.block} onChange={handleChange}>
              <option value="Block A (Boys)">Block A (Boys)</option>
              <option value="Block B (Girls)">Block B (Girls)</option>
              <option value="Block C (International)">Block C (International)</option>
            </select>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Pass Type *</label>
            <select id="type" className="select-field" value={formData.type} onChange={handleChange}>
              <option value="Day Pass">Day Pass (same day return)</option>
              <option value="Weekend Pass">Weekend Pass</option>
              <option value="Emergency Pass">Emergency Pass</option>
              <option value="Medical Pass">Medical Pass</option>
              <option value="Vacation Pass">Vacation Pass</option>
            </select>
          </div>
          <div>
            <label className="form-label">Destination *</label>
            <input
              type="text" id="destination" className="input-field"
              placeholder="e.g. Bengaluru, Karnataka"
              value={formData.destination} onChange={handleChange} required
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Out Date *</label>
            <input
              type="date" id="outDate" className="input-field"
              min={today}
              value={formData.outDate} onChange={handleChange} required
            />
          </div>
          <div>
            <label className="form-label">Return Date *</label>
            <input
              type="date" id="returnDate" className="input-field"
              min={formData.outDate || today}
              value={formData.returnDate} onChange={handleChange} required
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Purpose / Reason *</label>
          <textarea
            id="purpose" className="textarea-field" rows="3"
            placeholder="Describe the purpose of your outing (family function, medical appointment, etc.)"
            value={formData.purpose} onChange={handleChange} required
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Gate Pass Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GatePassModal;
