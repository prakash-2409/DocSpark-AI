import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';

/**
 * SaveIndicator — visual autosave status in the editor's bottom bar.
 *
 * States:
 *   idle    → grey cloud icon
 *   saving  → spinning loader with "Saving..."
 *   saved   → green checkmark with "Saved" + relative timestamp
 *   error   → red alert icon with "Error"
 */
const SaveIndicator = ({ status = 'idle', lastSaved }) => {
  const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const config = {
    idle: {
      icon: Cloud,
      color: 'text-gray-400 dark:text-gray-600',
      label: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Not saved',
    },
    saving: {
      icon: Loader2,
      color: 'text-blue-500 dark:text-blue-400',
      label: 'Saving...',
      animate: true,
    },
    saved: {
      icon: Check,
      color: 'text-emerald-500 dark:text-emerald-400',
      label: 'Saved',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500 dark:text-red-400',
      label: 'Save failed',
    },
  };

  const current = config[status] || config.idle;
  const Icon = current.icon;

  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          <Icon
            size={12}
            className={`${current.color} ${current.animate ? 'animate-spin' : ''}`}
          />
          <span className={current.color}>{current.label}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SaveIndicator;
