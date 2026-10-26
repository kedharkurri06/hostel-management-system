import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password);
        addToast(`Welcome, ${formData.name}! Account registered.`, 'success');
      } else {
        await login(formData.email, formData.password);
        addToast(`Signed in successfully!`, 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = (email, password) => {
    setFormData({ name: '', email, password });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge" style={{ background: 'var(--accent-primary)', color: '#ffffff', marginBottom: '0.4rem' }}>
            Portal Access
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
            {isRegister ? 'Resident Registration' : 'Account Sign In'}
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

      {error && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              className="input-field"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="e.g. resident@hostelhub.edu"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Password *
          </label>
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Demo Fast-fill Buttons */}
        {!isRegister && (
          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Quick Demo Accounts (from database seed):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('warden@hostelhub.edu', 'WardenPass123!')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Warden Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('student@hostelhub.edu', 'StudentPass123!')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                Student Demo
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
          </button>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Please wait...' : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AuthModal;
