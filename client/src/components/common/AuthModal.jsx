import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    identifier: '',
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
        const res = await register(formData.name, formData.email, formData.password, formData.studentId);
        addToast(`Welcome, ${formData.name}! Account registered.`, 'success');
        if (onLoginSuccess && res.data && res.data.user) {
          onLoginSuccess(res.data.user.role);
        }
      } else {
        const res = await login(formData.identifier, formData.password);
        addToast(`Welcome, ${res.data.user.name}! Signed in successfully.`, 'success');
        if (onLoginSuccess && res.data && res.data.user) {
          onLoginSuccess(res.data.user.role);
        }
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (identifier, password) => {
    setFormData(prev => ({ ...prev, identifier, password }));
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
            Portal Access
          </span>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            margin: 0,
            fontFamily: 'var(--font-serif)',
            color: 'var(--foreground)'
          }}>
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
          borderRadius: 'var(--radius)',
          background: 'rgba(153, 27, 27, 0.1)',
          color: 'var(--destructive)',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          border: '1px solid rgba(153, 27, 27, 0.25)'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {isRegister ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="e.g. JALLURI VENKATA SRIRAM"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Student ID (Optional)</label>
              <input
                type="text"
                name="studentId"
                className="input-field"
                placeholder="e.g. VTU27571"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="e.g. resident@hostelhub.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">
              Student ID or Warden Username *
            </label>
            <input
              type="text"
              name="identifier"
              className="input-field"
              placeholder="e.g. VTU27571 or warden@vtu"
              value={formData.identifier}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>
        )}

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder={isRegister ? "At least 6 characters" : "Enter your password"}
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        {/* Demo Fast-fill Buttons */}
        {!isRegister && (
          <div style={{
            background: 'var(--muted)',
            padding: '0.85rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1.25rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Demo Accounts:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleDemoFill('VTU27571', 'VTU27571')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                👨‍🎓 Student (VTU27571)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('warden@vtu', 'warden@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                🛡️ Warden (warden@vtu)
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
              color: 'var(--primary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontFamily: 'var(--font-sans)'
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
