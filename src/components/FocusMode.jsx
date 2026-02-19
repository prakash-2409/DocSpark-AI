import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EditorContent } from '@tiptap/react';
import { X, Maximize2, Type } from 'lucide-react';

/**
 * FocusMode — zen writing overlay.
 * Hides everything except the editor canvas on a soft ambient background.
 * Shows a floating mini bar with word count + exit button.
 */
const FocusMode = ({ editor, isActive, onExit }) => {
  // Escape key to exit
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onExit();
  }, [onExit]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isActive, handleKeyDown]);

  const wordCount = editor
    ? (editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0)
    : 0;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center"
        >
          {/* Ambient gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900" />
          
          {/* Soft animated glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 dark:bg-blue-800/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Floating mini bar */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex items-center gap-4 mt-6 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50"
          >
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Type size={14} />
              <span className="font-medium text-gray-700 dark:text-gray-300">{wordCount}</span>
              <span>words</span>
            </div>
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
              title="Exit Focus Mode (Esc)"
            >
              <X size={14} />
              <span>Exit</span>
            </button>
          </motion.div>

          {/* Editor canvas — centered paper */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="relative z-10 flex-1 w-full max-w-3xl overflow-y-auto mt-6 mb-8 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl min-h-[80vh] overflow-hidden border border-gray-100">
              <EditorContent editor={editor} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FocusMode;
