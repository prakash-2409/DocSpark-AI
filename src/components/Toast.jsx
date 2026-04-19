import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertCircle, Info, X, Download,
  Save, AlertTriangle
} from 'lucide-react';

/**
 * Toast Notification System
 *
 * Provides a global, animated toast notification system.
 * Types: success, error, info, warning
 */

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500, icon }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, title, message, duration, icon }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message, duration: 5000 }),
    info: (title, message) => addToast({ type: 'info', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message, duration: 4500 }),
    export: (title, message) => addToast({ type: 'success', title, message, icon: 'download' }),
    save: (title, message) => addToast({ type: 'success', title, message, icon: 'save', duration: 2000 }),
    custom: addToast,
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

/* ── Toast Container — renders in bottom-right corner ─── */
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Individual Toast Item ───────────────────────────── */
const typeConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-700/50',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-800 dark:text-red-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-700/50',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-700/50',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800 dark:text-amber-300',
  },
};

const iconOverrides = {
  download: Download,
  save: Save,
};

function ToastItem({ toast, onDismiss }) {
  const config = typeConfig[toast.type] || typeConfig.info;
  const IconComponent = toast.icon && iconOverrides[toast.icon]
    ? iconOverrides[toast.icon]
    : config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm ${config.bg} ${config.border}`}
    >
      <IconComponent size={18} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default ToastProvider;
