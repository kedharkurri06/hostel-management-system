import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckIcon, InfoIcon } from './Icons';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast"
          onClick={() => removeToast(toast.id)}
          style={{ cursor: 'pointer' }}
        >
          {toast.type === 'success' ? <CheckIcon /> : <InfoIcon />}
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
