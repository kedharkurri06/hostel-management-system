import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const EditMealModal = ({ isOpen, onClose, day, mealKey, mealData, menuId, onUpdated }) => {
  const { addToast } = useToast();
  const [time, setTime] = useState('');
  const [type, setType] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mealData) {
      setTime(mealData.time || '');
      setType(mealData.type || '');
      setItemsText((mealData.items || []).join(', '));
    }
  }, [mealData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!menuId || !mealKey) return;

    setSubmitting(true);
    try {
      const items = itemsText.split(',').map(i => i.trim()).filter(Boolean);
      await api.menu.update(menuId, {
        meal: mealKey,
        time,
        type,
        items
      });
      addToast(`Updated ${day} ${mealKey.toUpperCase()} menu!`, 'success', 3000, 'Menu Saved');
      onUpdated();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to update meal slot', 'error', 3500, 'Save Failed');
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
        Edit {day} - {mealKey?.toUpperCase()} Menu
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
        Update dishes served for this meal slot. Separate dishes with commas.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Meal Time Slot
          </label>
          <input
            type="text"
            className="input-field"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Meal Type Tag
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Veg, Non-Veg options, Special Dinner"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">
            Dishes (comma separated)
          </label>
          <textarea
            className="textarea-field"
            rows="4"
            value={itemsText}
            onChange={(e) => setItemsText(e.target.value)}
            required
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMealModal;
