import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({
    type = 'info', // 'success' | 'error' | 'info' | 'warning'
    title,
    message,
    duration = 4000,
  }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ message: options });
    }
    return addToast(options);
  }, [addToast]);

  toast.success = (message, title = 'Success') => addToast({ type: 'success', title, message });
  toast.error = (message, title = 'Error') => addToast({ type: 'error', title, message });
  toast.info = (message, title = 'Notice') => addToast({ type: 'info', title, message });
  toast.warning = (message, title = 'Warning') => addToast({ type: 'warning', title, message });

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
