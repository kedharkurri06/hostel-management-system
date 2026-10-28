import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const StaffModal = ({ isOpen, onClose, staff, onSaved }) => {
  const { addToast } = useToast();
  const isEditing = Boolean(staff);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: '',
    availability: 'On Duty (8 AM - 8 PM)'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        designation: staff.designation || '',
        phone: staff.phone || '',
        availability: staff.availability || 'On Duty (8 AM - 8 PM)'
      });
    } else {
      setFormData({
        name: '',
        designation: '',
        phone: '',
        availability: 'On Duty (8 AM - 8 PM)'
      });
    }
  }, [staff, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim() || !formData.phone.trim() || !formData.availability.trim()) {
      addToast('Please fill in all technician details', 'error', 3000, 'Missing Fields');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const id = staff._id;
        const res = await api.wardens.updateStaff(id, formData);
        if (res.success) {
          addToast(`Technician "${formData.name}" updated successfully!`, 'success', 3000, 'Technician Updated');
          onSaved && onSaved();
          onClose();
        }
      } else {
        const res = await api.wardens.createStaff(formData);
        if (res.success) {
          addToast(`New technician "${formData.name}" added successfully!`, 'success', 3000, 'Technician Added');
          onSaved && onSaved();
          onClose();
        }
      }
    } catch (err) {
      addToast(err.message || 'Operation failed. Warden authorization required.', 'error', 3500, 'Action Failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge" style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            marginBottom: '0.4rem'
          }}>
            Maintenance Directory
          </span>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            {isEditing ? 'Edit Technician Contact' : 'Add New Emergency Technician'}
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
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Technician Name *</label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Trade / Designation *</label>
          <input
            type="text"
            name="designation"
            className="input-field"
            placeholder="e.g. Chief AC & HVAC Engineer, Head Electrician"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Emergency Phone *</label>
          <input
            type="tel"
            name="phone"
            className="input-field"
            placeholder="e.g. +91 98111 22334"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Availability / Working Shift *</label>
          <input
            type="text"
            name="availability"
            className="input-field"
            placeholder="e.g. 24x7 Emergency On-Call, On Duty (8 AM - 8 PM)"
            value={formData.availability}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Technician')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal;

