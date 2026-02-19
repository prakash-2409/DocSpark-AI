import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileType, FileText, FileDown, ChevronDown, Loader2, Shield } from 'lucide-react';
import { exportToPDF, exportToDOCX, exportToTXT } from '../lib/exportService';
import { remainingFreeExports, FREE_EXPORT_LIMIT } from '../lib/exportLimit';

/**
 * ExportMenu — dropdown to export editor content to PDF / DOCX / TXT.
 */
const ExportMenu = ({ editor, fileName = 'document' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // 'pdf' | 'docx' | 'txt' | null
  const remaining = remainingFreeExports();

  const handleExport = async (format) => {
    if (!editor) return;
    setExporting(format);

    try {
      const cleanName = fileName.replace(/\.[^/.]+$/, '') || 'document';

      switch (format) {
        case 'pdf':
          await exportToPDF(cleanName);
          break;
        case 'docx':
          await exportToDOCX(editor, cleanName);
          break;
        case 'txt':
          exportToTXT(editor, cleanName);
          break;
      }
    } catch (err) {
      console.error(`Export to ${format} failed:`, err);
      alert(`Export failed. Please try again.`);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const options = [
    {
      format: 'pdf',
      label: 'Export as PDF',
      description: 'Best for sharing & printing',
      icon: FileType,
      color: 'text-red-500',
    },
    {
      format: 'docx',
      label: 'Export as Word',
      description: 'Editable in Microsoft Word',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      format: 'txt',
      label: 'Export as Text',
      description: 'Plain text, no formatting',
      icon: FileDown,
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all active:scale-95"
      >
        <Download size={18} />
        <span>Export</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl py-2 min-w-[240px]"
            >
              {options.map(({ format, label, description, icon: Icon, color }) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={exporting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 ${color}`}>
                    {exporting === format ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                    <div className="text-xs text-gray-400">{description}</div>
                  </div>
                </button>
              ))}

              {/* Watermark notice */}
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                {remaining > 0 ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <Shield size={13} />
                    <span>{remaining} watermark-free export{remaining !== 1 ? 's' : ''} left</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">
                    <span className="text-amber-500">Watermark applied</span> — free exports used
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportMenu;
