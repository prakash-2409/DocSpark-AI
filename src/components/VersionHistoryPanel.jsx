import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, X, RotateCcw, Clock, Type, ChevronRight,
  Trash2, AlertTriangle
} from 'lucide-react';

/**
 * VersionHistoryPanel — slide-in drawer showing the last N autosave snapshots.
 *
 * Props:
 *   isOpen         — boolean
 *   onClose        — () => void
 *   versionHistory — array of { content, title, savedAt, wordCount }
 *   onRestore      — (content: string) => void
 *   onClearHistory — () => void
 */
const VersionHistoryPanel = ({
  isOpen,
  onClose,
  versionHistory = [],
  onRestore,
  onClearHistory,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleRestore = (version) => {
    onRestore(version.content);
    onClose();
  };

  const handleClear = () => {
    if (confirmClear) {
      onClearHistory();
      setConfirmClear(false);
      onClose();
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-[121] w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700/60 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <History size={16} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Version History
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {versionHistory.length} snapshot{versionHistory.length !== 1 ? 's' : ''} saved
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Version list */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
              {versionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
                    <Clock size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No versions yet. Start writing to create autosave snapshots.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {versionHistory.map((version, index) => {
                    const isPreview = previewIndex === index;
                    const isCurrent = index === 0;

                    return (
                      <motion.div
                        key={`${version.savedAt}-${index}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`group px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          isPreview ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                        onClick={() => setPreviewIndex(isPreview ? null : index)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isCurrent && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                                  Latest
                                </span>
                              )}
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                {version.title || 'Untitled Document'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatDate(version.savedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Type size={10} />
                                {(version.wordCount || 0).toLocaleString()} words
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRestore(version); }}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              title="Restore this version"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <ChevronRight
                              size={13}
                              className={`text-gray-400 transition-transform ${isPreview ? 'rotate-90' : ''}`}
                            />
                          </div>
                        </div>

                        {/* Inline preview */}
                        <AnimatePresence>
                          {isPreview && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <div
                                  className="text-xs text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: version.content
                                      ?.replace(/<[^>]+>/g, ' ')
                                      .replace(/\s+/g, ' ')
                                      .trim()
                                      .slice(0, 300) + '...' || 'Empty document',
                                  }}
                                />
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRestore(version); }}
                                className="mt-2 w-full py-2 rounded-lg text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <RotateCcw size={12} />
                                Restore this version
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer — clear history */}
            {versionHistory.length > 0 && (
              <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleClear}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    confirmClear
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {confirmClear ? (
                    <>
                      <AlertTriangle size={14} />
                      Click again to confirm
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Clear History
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VersionHistoryPanel;
