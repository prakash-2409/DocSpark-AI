import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Crown, User, History, Command,
  FileType, FileText, FileDown, Code, Maximize2,
  ChevronDown
} from 'lucide-react';

// Components
import Editor from './components/Editor';
import AIToolbar from './components/AIToolbar';
import PricingModal from './components/PricingModal';
import CommandPalette from './components/CommandPalette';
import VersionHistoryPanel from './components/VersionHistoryPanel';
import DocumentTitle from './components/DocumentTitle';
import FocusMode from './components/FocusMode';
import { ToastProvider, useToast } from './components/Toast';

// Hooks
import { useAutosave, loadSavedDocument, clearSavedDocument } from './hooks/useAutosave';
import { useCommandPalette } from './hooks/useCommandPalette';

// Services
import {
  exportToPDF, exportToDOCX, exportToTXT,
  exportToHTML, exportToMarkdown
} from './lib/exportService';

/* ── Export Dropdown ─────────────────────────────────────── */
const ExportDropdown = ({ onExportPDF, onExportDOCX, onExportTXT, onExportHTML, onExportMD, isDarkMode }) => {
  const [open, setOpen] = useState(false);

  const options = [
    { label: 'PDF', description: 'Pixel-perfect A4', icon: FileType, color: 'text-red-500', action: onExportPDF },
    { label: 'Word (.docx)', description: 'Formatted document', icon: FileText, color: 'text-blue-500', action: onExportDOCX },
    { label: 'Plain Text', description: 'Clean .txt file', icon: FileDown, color: 'text-gray-500', action: onExportTXT },
    { label: 'HTML', description: 'Styled web document', icon: Code, color: 'text-orange-500', action: onExportHTML },
    { label: 'Markdown', description: 'GitHub-ready .md', icon: FileDown, color: 'text-purple-500', action: onExportMD },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all active:scale-95"
      >
        <FileDown size={16} />
        <span>Export</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl shadow-2xl border overflow-hidden ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700/60'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="p-1.5">
                {options.map(({ label, description, icon: Icon, color, action }) => (
                  <button
                    key={label}
                    onClick={() => { action(); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      isDarkMode
                        ? 'hover:bg-gray-800 text-gray-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon size={15} className={color} />
                    <div>
                      <div className="text-sm font-medium">{label}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main App (inner, has toast access) ──────────────────── */
function AppInner() {
  const toast = useToast();
  const cmdPalette = useCommandPalette();

  // ── Core state ───────────────────────────────────────────
  const [content, setContent] = useState(() => {
    const saved = loadSavedDocument();
    return saved?.content || '<p>Start writing something amazing...</p>';
  });
  const [editorInstance, setEditorInstance] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('convertflow-theme') === 'dark'
        || window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });
  const [userPlan, setUserPlan] = useState('free');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isPaidUser = userPlan === 'pro' || userPlan === 'enterprise';

  // ── Autosave ─────────────────────────────────────────────
  const {
    saveStatus,
    lastSaved,
    documentTitle,
    setDocumentTitle,
    versionHistory,
    clearHistory,
    restoreVersion,
    manualSave,
  } = useAutosave(content, { enabled: true });

  // ── Dark mode persistence + body class ───────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('convertflow-theme', isDarkMode ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => setIsDarkMode((v) => !v), []);

  // ── Recovery toast on first load ─────────────────────────
  useEffect(() => {
    const saved = loadSavedDocument();
    if (saved?.savedAt) {
      const ago = Math.floor((Date.now() - new Date(saved.savedAt)) / 1000);
      if (ago > 60) {
        const mins = Math.floor(ago / 60);
        toast.info(
          'Document Restored',
          `Loaded your autosave from ${mins > 60 ? `${Math.floor(mins / 60)}h` : `${mins}m`} ago`
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Ctrl+S → manual save ─────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
        toast.save('Saved', 'Document saved to browser storage');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualSave, toast]);

  // ── Export handlers (all with toast feedback) ─────────────
  const withExportFeedback = useCallback(async (label, fn) => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await fn();
      toast.export(`${label} exported`, `${documentTitle}.${label.toLowerCase()}`);
    } catch (err) {
      console.error(`Export ${label} failed:`, err);
      toast.error(`${label} Export Failed`, err.message || 'An unexpected error occurred');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, documentTitle, toast]);

  const handleExportPDF = useCallback(() =>
    withExportFeedback('PDF', () => exportToPDF(documentTitle)),
  [withExportFeedback, documentTitle]);

  const handleExportDOCX = useCallback(() =>
    withExportFeedback('Word', () => exportToDOCX(editorInstance, documentTitle, documentTitle)),
  [withExportFeedback, editorInstance, documentTitle]);

  const handleExportTXT = useCallback(() =>
    withExportFeedback('TXT', () => exportToTXT(editorInstance, documentTitle)),
  [withExportFeedback, editorInstance, documentTitle]);

  const handleExportHTML = useCallback(() =>
    withExportFeedback('HTML', () => exportToHTML(editorInstance, documentTitle, documentTitle)),
  [withExportFeedback, editorInstance, documentTitle]);

  const handleExportMD = useCallback(() =>
    withExportFeedback('Markdown', () => exportToMarkdown(editorInstance, documentTitle)),
  [withExportFeedback, editorInstance, documentTitle]);

  // ── Clear document ────────────────────────────────────────
  const handleClearDocument = useCallback(() => {
    if (!editorInstance) return;
    editorInstance.commands.clearContent();
    clearSavedDocument();
    toast.info('Document Cleared', 'Started fresh');
  }, [editorInstance]);

  // ── Restore version ───────────────────────────────────────
  const handleRestoreVersion = useCallback((htmlContent) => {
    if (!editorInstance) return;
    editorInstance.commands.setContent(htmlContent);
    setContent(htmlContent);
    toast.success('Version Restored', 'Document reverted to selected snapshot');
  }, [editorInstance]);

  // ── Plan selection ────────────────────────────────────────
  const handleSelectPlan = useCallback((planId) => {
    setUserPlan(planId);
    if (planId === 'pro') toast.success('Welcome to Pro!', 'All AI features are now unlocked');
    else if (planId === 'enterprise') toast.info('Enterprise', 'Our team will contact you shortly');
  }, [toast]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">

        {/* ── Header ──────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8">
          {/* Left: Title */}
          <DocumentTitle
            value={documentTitle}
            onChange={setDocumentTitle}
            isDarkMode={isDarkMode}
          />

          {/* Right: controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Plan badge */}
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm ${
              isPaidUser
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent'
                : isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300'
                  : 'bg-white border-gray-200 text-gray-600'
            }`}>
              {isPaidUser ? <Crown size={14} className="text-yellow-300" /> : <User size={14} />}
              <span className="font-medium capitalize">{userPlan}</span>
            </div>

            {/* Upgrade */}
            {!isPaidUser && (
              <button
                onClick={() => setShowPricingModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all active:scale-95"
              >
                <Crown size={14} />
                Upgrade
              </button>
            )}

            <div className={`h-7 w-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

            {/* Version history */}
            <button
              onClick={() => setShowVersionHistory(true)}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100'
                  : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
              }`}
              title="Version History"
            >
              <History size={17} />
            </button>

            {/* Command palette trigger */}
            <button
              onClick={cmdPalette.open}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 border border-gray-700'
                  : 'bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm'
              }`}
              title="Command Palette (Ctrl+K)"
            >
              <Command size={14} />
              <span>Ctrl+K</span>
            </button>

            {/* Focus mode */}
            <button
              onClick={() => setIsFocusMode(true)}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100'
                  : 'bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-200'
              }`}
              title="Focus Mode"
            >
              <Maximize2 size={17} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-white hover:bg-gray-100 text-gray-600 shadow-sm border border-gray-200'
              }`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <div className={`h-7 w-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

            {/* AI Toolbar */}
            <AIToolbar
              editor={editorInstance}
              isPaidUser={isPaidUser}
              onUpgradeClick={() => setShowPricingModal(true)}
            />

            <div className={`h-7 w-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />

            {/* Export dropdown */}
            <ExportDropdown
              onExportPDF={handleExportPDF}
              onExportDOCX={handleExportDOCX}
              onExportTXT={handleExportTXT}
              onExportHTML={handleExportHTML}
              onExportMD={handleExportMD}
              isDarkMode={isDarkMode}
            />
          </div>
        </header>

        {/* ── Editor ──────────────────────────────────────── */}
        <main className="flex-1 flex flex-col">
          <Editor
            content={content}
            onChange={setContent}
            setEditorInstance={setEditorInstance}
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            isDarkMode={isDarkMode}
          />

          {/* Keyboard hint bar */}
          <div className={`mt-3 flex items-center justify-center gap-4 text-[11px] ${
            isDarkMode ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <span>Select text for formatting options</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}>Ctrl+K</kbd>
              Command palette
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}>Ctrl+S</kbd>
              Save
            </span>
          </div>
        </main>
      </div>

      {/* ── Overlays & Modals ────────────────────────────── */}

      {/* Command Palette */}
      <CommandPalette
        isOpen={cmdPalette.isOpen}
        onClose={cmdPalette.close}
        editor={editorInstance}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
        onExportTXT={handleExportTXT}
        onExportHTML={handleExportHTML}
        onToggleTheme={toggleTheme}
        onFocusMode={() => setIsFocusMode(true)}
        onClearDocument={handleClearDocument}
        onManualSave={() => { manualSave(); toast.save('Saved', 'Document saved'); }}
        onShowHistory={() => setShowVersionHistory(true)}
        isDarkMode={isDarkMode}
      />

      {/* Version History Panel */}
      <VersionHistoryPanel
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        versionHistory={versionHistory}
        onRestore={handleRestoreVersion}
        onClearHistory={clearHistory}
      />

      {/* Focus Mode */}
      <FocusMode
        editor={editorInstance}
        isActive={isFocusMode}
        onExit={() => setIsFocusMode(false)}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />

      {/* Export loading overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/20 backdrop-blur-sm flex items-center justify-center"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <svg className="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Generating export...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Root App wrapped with ToastProvider ─────────────────── */
function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

export default App;
