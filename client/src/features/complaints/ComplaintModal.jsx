import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ComplaintModal = ({ isOpen, onClose, onComplaintCreated }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    phone: '',
    roomNo: '',
    block: 'Block A (Boys)',
    category: 'AC',
    priority: 'Medium',
    visitTimeSlot: '10:00 AM - 1:00 PM',
    description: ''
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
      const res = await api.complaints.create(formData);
      if (res.success && res.data) {
        addToast(`Ticket #${res.data.ticketId} submitted successfully!`, 'success', 3000, 'Complaint Filed');
        setFormData({
          studentName: '',
          phone: '',
          roomNo: '',
          block: 'Block A (Boys)',
          category: 'AC',
          priority: 'Medium',
          visitTimeSlot: '10:00 AM - 1:00 PM',
          description: ''
        });
        onComplaintCreated(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit complaint', 'error', 3500, 'Submission Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge badge-pending" style={{ marginBottom: '0.4rem' }}>Maintenance Dispatch</span>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            Register Room Complaint
          </h2>
        </div>
        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.6rem', borderRadius: '50%' }}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">
              Resident Name *
            </label>
            <input
              type="text"
              id="studentName"
              className="input-field"
              placeholder="e.g. Rahul Sharma"
              value={formData.studentName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">
              Mobile Number *
            </label>
            <input
              type="tel"
              id="phone"
              className="input-field"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">
              Room Number *
            </label>
            <input
              type="text"
              id="roomNo"
              className="input-field"
              placeholder="e.g. 304"
              value={formData.roomNo}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">
              Hostel Block *
            </label>
            <select
              id="block"
              className="select-field"
              value={formData.block}
              onChange={handleChange}
            >
              <option value="Block A (Boys)">Block A (Boys)</option>
              <option value="Block B (Girls)">Block B (Girls)</option>
              <option value="Block C (International)">Block C (International)</option>
            </select>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">
              Complaint Category *
            </label>
            <select
              id="category"
              className="select-field"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="AC">AC / HVAC Cooling</option>
              <option value="Water">Plumbing / Water Leakage</option>
              <option value="Electrical">Electrical / Light &amp; Power</option>
              <option value="Wi-Fi">Wi-Fi / Internet Connectivity</option>
              <option value="Cleanliness">Room &amp; Washroom Housekeeping</option>
              <option value="Furniture">Furniture &amp; Carpentry</option>
              <option value="Pest Control">Pest Control Service</option>
            </select>
          </div>
          <div>
            <label className="form-label">
              Priority Level *
            </label>
            <select
              id="priority"
              className="select-field"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low (Can resolve in 48 hrs)</option>
              <option value="Medium">Medium (Standard within 24 hrs)</option>
              <option value="High">High (Needs same day visit)</option>
              <option value="Emergency">Emergency (Immediate / Hazard)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Preferred Visit Time Slot
          </label>
          <select
            id="visitTimeSlot"
            className="select-field"
            value={formData.visitTimeSlot}
            onChange={handleChange}
          >
            <option value="10:00 AM - 1:00 PM">Morning (10:00 AM - 1:00 PM)</option>
            <option value="2:00 PM - 5:00 PM">Afternoon (2:00 PM - 5:00 PM)</option>
            <option value="5:00 PM - 8:00 PM">Evening (5:00 PM - 8:00 PM)</option>
            <option value="Immediate / Emergency">Immediate / Emergency Access Granted</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Detailed Problem Description *
          </label>
          <textarea
            id="description"
            className="textarea-field"
            rows="3"
            placeholder="Describe the issue clearly..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintModal;
