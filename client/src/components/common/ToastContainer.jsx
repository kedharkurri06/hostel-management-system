import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer = () => {
  const { activeToast, isExiting, removeToast } = useToast();

  if (!activeToast) return null;

  const isSuccess = activeToast.type === 'success';
  const isError = activeToast.type === 'error';
  const isInfo = activeToast.type === 'info';

  const defaultTitle = isSuccess ? 'Successful' : (isError ? 'Unsuccessful' : 'Notification');
  const displayTitle = activeToast.title || defaultTitle;

  return (
    <div
      className={`toast-center-backdrop ${isExiting ? 'exiting' : ''}`}
      onClick={removeToast}
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className={`toast-center-card ${isExiting ? 'exiting' : ''} toast-theme-${activeToast.type || 'info'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with status pill and close button */}
        <div className="toast-card-header">
          <span className={`toast-status-badge badge-${activeToast.type || 'info'}`}>
            {isSuccess ? 'SUCCESS' : (isError ? 'ALERT' : 'NOTICE')}
          </span>
          <button
            onClick={removeToast}
            className="toast-close-btn"
            aria-label="Close notification"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Center Animated Icon Badge */}
        <div className="toast-icon-wrapper">
          {isSuccess && (
            <div className="toast-icon-circle icon-success">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}

          {isError && (
            <div className="toast-icon-circle icon-error">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          )}

          {isInfo && (
            <div className="toast-icon-circle icon-info">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
          )}
        </div>

        {/* Title and Message Body */}
        <div className="toast-content-body">
          <h3 className="toast-title">{displayTitle}</h3>
          <p className="toast-message">{activeToast.message}</p>
        </div>

        {/* Bottom Action Button */}
        <div className="toast-action-footer">
          <button
            onClick={removeToast}
            className={`btn toast-action-btn btn-${activeToast.type || 'primary'}`}
            autoFocus
          >
            {isSuccess ? 'Continue' : (isError ? 'Dismiss' : 'Understood')}
          </button>
        </div>

        {/* Bottom Countdown Progress Line */}
        {activeToast.duration > 0 && (
          <div
            className="toast-progress-bar"
            style={{ animationDuration: `${activeToast.duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};

export default ToastContainer;
