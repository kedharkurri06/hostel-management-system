import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer = () => {
  const {
    activeToast,
    isExiting,
    removeToast,
    confirmState,
    isConfirmExiting,
    handleConfirmResponse
  } = useToast();

  // If a confirmation prompt is active, display the interactive Confirm Modal
  if (confirmState) {
    const isDanger = confirmState.type === 'danger';
    return (
      <div
        className={`toast-center-backdrop ${isConfirmExiting ? 'exiting' : ''}`}
        onClick={() => handleConfirmResponse(false)}
        role="alertdialog"
        aria-modal="true"
      >
        <div
          className={`toast-center-card ${isConfirmExiting ? 'exiting' : ''} toast-theme-${isDanger ? 'error' : 'info'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row */}
          <div className="toast-card-header">
            <span className={`toast-status-badge ${isDanger ? 'badge-warning' : 'badge-info'}`}>
              CONFIRMATION
            </span>
            <button
              onClick={() => handleConfirmResponse(false)}
              className="toast-close-btn"
              aria-label="Cancel"
              title="Cancel"
            >
              ✕
            </button>
          </div>

          {/* Animated Warning Icon Badge */}
          <div className="toast-icon-wrapper">
            <div className={`toast-icon-circle ${isDanger ? 'icon-warning' : 'icon-info'}`}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>

          {/* Title and Message */}
          <div className="toast-content-body">
            <h3 className="toast-title">{confirmState.title}</h3>
            <p className="toast-message">{confirmState.message}</p>
          </div>

          {/* Dual Action Buttons (Cancel / Confirm) */}
          <div className="toast-action-footer">
            <div className="toast-confirm-actions">
              <button
                type="button"
                onClick={() => handleConfirmResponse(false)}
                className="btn btn-secondary toast-btn-half"
              >
                {confirmState.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResponse(true)}
                className={`btn ${isDanger ? 'btn-error' : 'btn-primary'} toast-btn-half`}
                autoFocus
              >
                {confirmState.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, if an active Toast / Alert is present, render standard notification popup
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
