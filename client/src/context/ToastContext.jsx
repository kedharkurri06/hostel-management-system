import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [activeToast, setActiveToast] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

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

  return (
    <ToastContext.Provider value={{ activeToast, isExiting, addToast, removeToast }}>
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
