import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ToastContext = createContext();
const ConfirmContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);

  const confirm = useCallback((title, message, confirmText = 'Tamam', cancelText = 'İptal', type = 'warning') => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error }}>
      <ConfirmContext.Provider value={{ confirm }}>
        {children}
        {confirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99998]" onClick={confirmDialog.onCancel}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmDialog.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-6 h-6 ${confirmDialog.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{confirmDialog.title}</h3>
                    <p className="text-sm text-gray-600">{confirmDialog.message}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={confirmDialog.onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    {confirmDialog.cancelText}
                  </button>
                  <button
                    onClick={confirmDialog.onConfirm}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                      confirmDialog.type === 'warning' 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {confirmDialog.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};

