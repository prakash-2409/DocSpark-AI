import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, FileSpreadsheet, File, MoreVertical,
  Pencil, Trash2, ExternalLink, Clock
} from 'lucide-react';
import { getFileTypeColor } from '../lib/fileParser';

/**
 * FileCard — displays a single document in the Quick Access Hub.
 * Shows file icon, name, type badge, last opened time, and action menu.
 */
const FileCard = ({ file, onOpen, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState(file.name);

  const iconColor = getFileTypeColor(file.type);

  const getIcon = () => {
    switch (file.type) {
      case 'csv':
      case 'xlsx':
        return FileSpreadsheet;
      case 'pdf':
      case 'docx':
      case 'txt':
        return FileText;
      default:
        return File;
    }
  };

  const Icon = getIcon();

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onRename(file.id, nameInput.trim());
    }
    setIsRenaming(false);
  };

  const typeBadge = {
    txt: { label: 'TXT', bg: 'bg-gray-100 text-gray-600' },
    docx: { label: 'DOCX', bg: 'bg-blue-100 text-blue-700' },
    pdf: { label: 'PDF', bg: 'bg-red-100 text-red-700' },
    csv: { label: 'CSV', bg: 'bg-green-100 text-green-700' },
    xlsx: { label: 'XLSX', bg: 'bg-emerald-100 text-emerald-700' },
    new: { label: 'DOC', bg: 'bg-indigo-100 text-indigo-700' },
  };

  const badge = typeBadge[file.type] || typeBadge.new;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer"
      onClick={() => !isRenaming && onOpen(file.id)}
    >
      {/* Top row: icon + type badge + menu */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 ${iconColor}`}>
          <Icon size={22} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.bg}`}>
            {badge.label}
          </span>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onOpen(file.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ExternalLink size={14} /> Open
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); setIsRenaming(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(file.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File name */}
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()} className="mb-2">
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRenameSubmit}
            className="w-full px-2 py-1 text-sm font-semibold border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-blue-600"
          />
        </form>
      ) : (
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1" title={file.name}>
          {file.name}
        </h3>
      )}

      {/* Meta info */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {formatTime(file.lastOpenedAt)}
        </span>
        <span>{formatSize(file.size)}</span>
      </div>
    </motion.div>
  );
};

export default FileCard;
