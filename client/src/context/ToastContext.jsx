import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [activeToast, setActiveToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState(null);
  const [isConfirmExiting, setIsConfirmExiting] = useState(false);
  const confirmResolveRef = useRef(null);

  const removeToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsExiting(true);
    setTimeout(() => {
      setActiveToast(null);
      setIsExiting(false);
    }, 300); // 0.3s smooth exit animation
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 3200, title = '') => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsExiting(false);
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration, title };
    setActiveToast(newToast);

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        removeToast();
      }, duration);
    }
  }, [removeToast]);

  const confirmDialog = useCallback((options) => {
    const config = typeof options === 'string'
      ? { message: options, title: 'Confirm Action', confirmText: 'Yes, Proceed', cancelText: 'Cancel', type: 'danger' }
      : {
          title: options.title || 'Confirm Action',
          message: options.message || 'Are you sure you want to proceed?',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          type: options.type || 'danger'
        };

    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setIsConfirmExiting(false);
      setConfirmState(config);
    });
  }, []);

  const handleConfirmResponse = useCallback((result) => {
    setIsConfirmExiting(true);
    setTimeout(() => {
      if (confirmResolveRef.current) {
        confirmResolveRef.current(result);
        confirmResolveRef.current = null;
      }
      setConfirmState(null);
      setIsConfirmExiting(false);
    }, 300); // 0.3s smooth exit animation
  }, []);

  return (
    <ToastContext.Provider value={{
      activeToast,
      isExiting,
      addToast,
      removeToast,
      confirmState,
      isConfirmExiting,
      confirmDialog,
      handleConfirmResponse
    }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export default ToastContext;
