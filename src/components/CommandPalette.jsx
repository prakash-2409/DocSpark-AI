import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, FileText, FileType, Download, Trash2, Moon, Sun,
  Maximize2, Save, History, Command, CornerDownLeft,
  Type, Code, Sparkles, FileDown, RotateCcw, Keyboard
} from 'lucide-react';

/**
 * CommandPalette — Spotlight-style command bar (Ctrl+K / Cmd+K).
 *
 * Dims background, shows centered search with instant fuzzy filtering.
 * Executes commands like export, clear, toggle theme, focus mode, etc.
 */
const CommandPalette = ({
  isOpen,
  onClose,
  editor,
  onExportPDF,
  onExportDOCX,
  onExportTXT,
  onExportHTML,
  onToggleTheme,
  onFocusMode,
  onClearDocument,
  onManualSave,
  onShowHistory,
  isDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // ── Command registry ────────────────────────────────────
  const commands = useMemo(() => [
    {
      id: 'export-pdf',
      label: 'Export to PDF',
      description: 'Download document as PDF file',
      icon: FileType,
      category: 'Export',
      shortcut: null,
      action: onExportPDF,
    },
    {
      id: 'export-docx',
      label: 'Export to Word',
      description: 'Download document as DOCX file',
      icon: FileText,
      category: 'Export',
      shortcut: null,
      action: onExportDOCX,
    },
    {
      id: 'export-txt',
      label: 'Export to TXT',
      description: 'Download as plain text file',
      icon: FileDown,
      category: 'Export',
      shortcut: null,
      action: onExportTXT,
    },
    {
      id: 'export-html',
      label: 'Export to HTML',
      description: 'Download as HTML file',
      icon: Code,
      category: 'Export',
      shortcut: null,
      action: onExportHTML,
    },
    {
      id: 'save',
      label: 'Save Document',
      description: 'Force save to browser storage',
      icon: Save,
      category: 'Document',
      shortcut: '⌘S',
      action: onManualSave,
    },
    {
      id: 'focus-mode',
      label: 'Toggle Focus Mode',
      description: 'Distraction-free writing experience',
      icon: Maximize2,
      category: 'View',
      shortcut: null,
      action: onFocusMode,
    },
    {
      id: 'toggle-theme',
      label: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle between light and dark themes',
      icon: isDarkMode ? Sun : Moon,
      category: 'View',
      shortcut: null,
      action: onToggleTheme,
    },
    {
      id: 'version-history',
      label: 'Version History',
      description: 'Browse and restore past versions',
      icon: History,
      category: 'Document',
      shortcut: null,
      action: onShowHistory,
    },
    {
      id: 'clear-document',
      label: 'Clear Document',
      description: 'Remove all content and start fresh',
      icon: Trash2,
      category: 'Document',
      shortcut: null,
      action: onClearDocument,
    },
    {
      id: 'heading-1',
      label: 'Heading 1',
      description: 'Convert to large heading',
      icon: Type,
      category: 'Format',
      shortcut: null,
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'heading-2',
      label: 'Heading 2',
      description: 'Convert to medium heading',
      icon: Type,
      category: 'Format',
      shortcut: null,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'bold',
      label: 'Bold',
      description: 'Toggle bold formatting',
      icon: Type,
      category: 'Format',
      shortcut: '⌘B',
      action: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      id: 'italic',
      label: 'Italic',
      description: 'Toggle italic formatting',
      icon: Type,
      category: 'Format',
      shortcut: '⌘I',
      action: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      id: 'code-block',
      label: 'Code Block',
      description: 'Insert a code block',
      icon: Code,
      category: 'Format',
      shortcut: null,
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo last change',
      icon: RotateCcw,
      category: 'Edit',
      shortcut: '⌘Z',
      action: () => editor?.chain().focus().undo().run(),
    },
  ], [editor, onExportPDF, onExportDOCX, onExportTXT, onExportHTML, onToggleTheme, onFocusMode, onClearDocument, onManualSave, onShowHistory, isDarkMode]);

  // ── Fuzzy filter ────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [query, commands]);

  // ── Group by category ───────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((cmd) => {
      if (!map.has(cmd.category)) map.set(cmd.category, []);
      map.get(cmd.category).push(cmd);
    });
    return map;
  }, [filtered]);

  // ── Reset on open ───────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ── Keep selected index in bounds ───────────────────────
  useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selectedIndex]);

  // ── Keyboard navigation ─────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) {
        cmd.action?.();
        onClose();
      }
    }
  }, [filtered, selectedIndex, onClose]);

  // ── Scroll selected item into view ──────────────────────
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-0 top-[15%] z-[151] mx-auto w-full max-w-lg"
          >
            <div className="mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  ESC
                </kbd>
              </div>

              {/* Command list */}
              <div ref={listRef} className="max-h-72 overflow-y-auto py-2 scrollbar-thin">
                {filtered.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No commands found for "{query}"
                  </div>
                ) : (
                  Array.from(grouped.entries()).map(([category, cmds]) => (
                    <div key={category}>
                      <div className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
                        {category}
                      </div>
                      {cmds.map((cmd) => {
                        flatIndex++;
                        const idx = flatIndex;
                        const Icon = cmd.icon;
                        const isSelected = idx === selectedIndex;

                        return (
                          <button
                            key={cmd.id}
                            data-index={idx}
                            onClick={() => { cmd.action?.(); onClose(); }}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <Icon size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium">{cmd.label}</span>
                              <span className={`ml-2 text-xs ${isSelected ? 'text-blue-400 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                {cmd.description}
                              </span>
                            </div>
                            {cmd.shortcut && (
                              <kbd className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                                isSelected
                                  ? 'bg-blue-100 dark:bg-blue-800/40 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                              }`}>
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <CornerDownLeft size={10} /> Select
                  </span>
                  <span className="flex items-center gap-1">
                    ↑↓ Navigate
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                  <Command size={10} />
                  <span>+K to toggle</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
