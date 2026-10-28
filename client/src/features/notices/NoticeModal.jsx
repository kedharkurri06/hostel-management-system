import React, { useState } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const NoticeModal = ({ isOpen, onClose, onNoticeCreated }) => {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [priority, setPriority] = useState('Normal');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.notices.create({
        title,
        category,
        priority,
        content
      });

      if (res.success && res.data) {
        addToast(`Circular published: "${res.data.title}"`, 'success');
        setTitle('');
        setCategory('Maintenance');
        setPriority('Normal');
        setContent('');
        onNoticeCreated(res.data);
        onClose();
      }
    } catch (err) {
      addToast(err.message || 'Failed to post circular. (Warden authorization required)', 'info');
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
        Post New Hostel Circular
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
        Broadcast maintenance schedules or general rules to all residents.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Notice Title *
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Scheduled Wi-Fi Upgrade in Block A"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">
              Category
            </label>
            <select
              className="select-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Maintenance">Maintenance</option>
              <option value="Mess & Food">Mess &amp; Food</option>
              <option value="HVAC">HVAC &amp; Cooling</option>
              <option value="Security">Security &amp; Rules</option>
              <option value="General">General Announcement</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Priority Level
            </label>
            <select
              className="select-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Normal">Normal</option>
              <option value="High">High / Urgent</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Notice Content *
          </label>
          <textarea
            className="textarea-field"
            rows="4"
            placeholder="Type the announcement details..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeModal;
