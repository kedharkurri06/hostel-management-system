import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const WardenModal = ({ isOpen, onClose, warden, onSaved }) => {
  const { addToast } = useToast();
  const isEditing = Boolean(warden);

  const [formData, setFormData] = useState({
    wardenId: '',
    name: '',
    role: '',
    block: 'All Hostel Blocks',
    phone: '',
    email: '',
    office: '',
    hours: '9:00 AM - 5:00 PM (Mon - Sat)',
    avatar: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (warden) {
      setFormData({
        wardenId: warden.wardenId || '',
        name: warden.name || '',
        role: warden.role || '',
        block: warden.block || 'All Hostel Blocks',
        phone: warden.phone || '',
        email: warden.email || '',
        office: warden.office || '',
        hours: warden.hours || '9:00 AM - 5:00 PM (Mon - Sat)',
        avatar: warden.avatar || ''
      });
    } else {
      setFormData({
        wardenId: '',
        name: '',
        role: 'Warden',
        block: 'Block A (Boys)',
        phone: '',
        email: '',
        office: '',
        hours: '9:00 AM - 5:00 PM (Mon - Sat)',
        avatar: ''
      });
    }
  }, [warden, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditing) {
        const id = warden._id || warden.wardenId;
        const res = await api.wardens.update(id, formData);
        if (res.success) {
          addToast(`Warden profile for "${formData.name}" updated successfully!`, 'success', 3000, 'Profile Updated');
          onSaved && onSaved(res.data);
          onClose();
        }
      } else {
        const res = await api.wardens.create(formData);
        if (res.success) {
          addToast(`New warden "${formData.name}" added to directory!`, 'success', 3000, 'Warden Added');
          onSaved && onSaved(res.data);
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
            background: 'var(--sidebar-primary)',
            color: 'var(--sidebar-primary-foreground)',
            marginBottom: '0.4rem'
          }}>
            {isEditing ? 'Warden Management' : 'New Warden Directory Entry'}
          </span>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
            {isEditing ? `Edit Warden: ${warden?.name}` : 'Add New Warden Profile'}
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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder="e.g. Dr. Rajeshwar Rao"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">Designation / Role *</label>
            <input
              type="text"
              id="role"
              className="input-field"
              placeholder="e.g. Chief Warden / Warden - Boys Hostel"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Hostel Block Assignment *</label>
            <select
              id="block"
              className="select-field"
              value={formData.block}
              onChange={handleChange}
              required
            >
              <option value="All Hostel Blocks">All Hostel Blocks</option>
              <option value="Block A (Boys)">Block A (Boys)</option>
              <option value="Block B (Girls)">Block B (Girls)</option>
              <option value="Block C (International)">Block C (International)</option>
              <option value="Executive Quarters">Executive Quarters</option>
            </select>
          </div>
          <div>
            <label className="form-label">Warden ID Tag</label>
            <input
              type="text"
              id="wardenId"
              className="input-field"
              placeholder="e.g. W1, W5 (auto-assigned if blank)"
              value={formData.wardenId}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Official Mobile Number *</label>
            <input
              type="tel"
              id="phone"
              className="input-field"
              placeholder="e.g. +91 94112 00901"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="form-label">Official Email Address *</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="e.g. chiefwarden@hostelhub.edu"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Office Location</label>
            <input
              type="text"
              id="office"
              className="input-field"
              placeholder="e.g. Admin Building, Room 102"
              value={formData.office}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="form-label">Office Working Hours</label>
            <input
              type="text"
              id="hours"
              className="input-field"
              placeholder="e.g. 9:00 AM - 5:00 PM (Mon - Sat)"
              value={formData.hours}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Profile Photo URL (Optional)</label>
          <input
            type="url"
            id="avatar"
            className="input-field"
            placeholder="e.g. https://images.unsplash.com/photo-... or leave blank for default"
            value={formData.avatar}
            onChange={handleChange}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving Profile...' : (isEditing ? 'Save Warden Changes' : 'Add Warden Profile')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default WardenModal;

