import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Upload, FolderOpen, Search,
  Grid3X3, List, Trash2, ArrowRight, Clock,
  FileSpreadsheet, File, AlertCircle, HardDrive,
  Download, UploadCloud, Shield, Lock
} from 'lucide-react';
import FileCard from '../components/FileCard';
import { getAllFiles, deleteFile, renameFile, saveFile, getFile, exportLibrary, importLibrary, getStorageUsage } from '../lib/storage';
import { parseFile } from '../lib/fileParser';

/**
 * QuickAccessPage — the local document shelf.
 * 
 * Users can:
 *  - Browse all locally stored documents
 *  - Add files from device (any supported type)
 *  - Create a new blank document
 *  - Open, rename, or delete documents
 *  - Search / filter by name
 */
const QuickAccessPage = ({ onNavigate }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ totalBytes: 0, fileCount: 0 });
  const [backupStatus, setBackupStatus] = useState(null); // 'exporting' | 'importing' | { type, msg }
  const backupInputRef = useRef(null);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const docs = await getAllFiles();
      setFiles(docs);
      const usage = await getStorageUsage();
      setStorageInfo(usage);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter files by search query
  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new blank document
  const handleNewDocument = async () => {
    const id = await saveFile({
      name: 'Untitled Document',
      type: 'new',
      htmlContent: '<p></p>',
      size: 0,
    });
    onNavigate('editor', id);
  };

  // Import file from device
  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);

    try {
      const parsed = await parseFile(file);
      const id = await saveFile({
        name: file.name,
        type: parsed.type,
        rawData: parsed.rawData,
        htmlContent: parsed.htmlContent,
        size: file.size,
      });
      await loadFiles();
      // PDFs and images open in viewer (render as-is); others open in editor
      const viewerTypes = ['pdf', 'image'];
      onNavigate(viewerTypes.includes(parsed.type) ? 'file-viewer' : 'editor', id);
    } catch (err) {
      console.error('Import failed:', err);
      setImportError('Failed to import file. Please try a different format.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }, [onNavigate]);

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);

    try {
      const parsed = await parseFile(file);
      const id = await saveFile({
        name: file.name,
        type: parsed.type,
        rawData: parsed.rawData,
        htmlContent: parsed.htmlContent,
        size: file.size,
      });
      await loadFiles();
      const viewerTypes = ['pdf', 'image'];
      onNavigate(viewerTypes.includes(parsed.type) ? 'file-viewer' : 'editor', id);
    } catch (err) {
      console.error('Import failed:', err);
      setImportError('Failed to import file.');
    } finally {
      setImporting(false);
    }
  };

  // Rename
  const handleRename = async (id, newName) => {
    await renameFile(id, newName);
    await loadFiles();
  };

  // Delete
  const handleDelete = async (id) => {
    if (window.confirm('Remove this document from your local library?')) {
      await deleteFile(id);
      await loadFiles();
    }
  };

  // Open — PDFs and images open in viewer, others in editor
  const handleOpen = async (id) => {
    try {
      const doc = await getFile(id);
      const viewerTypes = ['pdf', 'image'];
      onNavigate(viewerTypes.includes(doc?.type) ? 'file-viewer' : 'editor', id);
    } catch {
      onNavigate('editor', id);
    }
  };

  // Backup — export entire library as .json
  const handleBackup = async () => {
    setBackupStatus('exporting');
    try {
      const blob = await exportLibrary();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dochub-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus({ type: 'success', msg: 'Backup downloaded successfully!' });
      setTimeout(() => setBackupStatus(null), 3000);
    } catch (err) {
      console.error('Backup failed:', err);
      setBackupStatus({ type: 'error', msg: 'Backup failed. Please try again.' });
      setTimeout(() => setBackupStatus(null), 3000);
    }
  };

  // Restore — import a .json backup file
  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!window.confirm('This will merge the backup with your current library. Existing documents with the same ID will be overwritten. Continue?')) return;

    setBackupStatus('importing');
    try {
      const result = await importLibrary(file);
      await loadFiles();
      setBackupStatus({ type: 'success', msg: `Restored ${result.imported} document${result.imported !== 1 ? 's' : ''}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}.` });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err) {
      console.error('Restore failed:', err);
      setBackupStatus({ type: 'error', msg: 'Invalid backup file. Make sure it was exported from DocHub.' });
      setTimeout(() => setBackupStatus(null), 3000);
    }
  };

  const formatStorage = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div
      className="flex flex-col gap-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {files.length} document{files.length !== 1 ? 's' : ''} stored locally on your device
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Document */}
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>New</span>
          </button>

          {/* Import File */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer active:scale-95">
            <Upload size={18} />
            <span>Import</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.md,.doc,.docx,.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
              onChange={handleImportFile}
            />
          </label>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Import Error */}
      {importError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
          <AlertCircle size={16} />
          {importError}
          <button onClick={() => setImportError(null)} className="ml-auto font-medium hover:underline">Dismiss</button>
        </div>
      )}

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-blue-600/10 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-dashed border-blue-400 p-12 text-center">
              <Upload size={48} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Drop file to import</h3>
              <p className="text-gray-500">Supports TXT, DOCX, PDF, CSV, XLSX, Images</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredFiles.length > 0 ? (
        /* File Grid / List */
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-2'
        }>
          <AnimatePresence>
            {filteredFiles.map(file => (
              <FileCard
                key={file.id}
                file={file}
                onOpen={handleOpen}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
            <FolderOpen size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {searchQuery
              ? 'Try a different search term.'
              : 'Create a new document or import an existing file to get started.'
            }
          </p>
          {!searchQuery && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewDocument}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all"
              >
                <Plus size={18} />
                New Document
              </button>
              <span className="text-gray-400">or</span>
              <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
                <Upload size={18} />
                Import File
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.doc,.docx,.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
                  onChange={handleImportFile}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Supported Formats */}
      <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Supported formats: TXT, DOCX, PDF, CSV, XLSX, PNG, JPG, GIF, WEBP, SVG &middot; All files stay on your device
      </div>

      {/* Local Storage & Backup Section */}
      <div className="mt-2 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Lock size={13} /> 100% Local Storage
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Files are stored in your browser's IndexedDB. Nothing is uploaded anywhere.</p>
          </div>
        </div>

        {/* Storage usage */}
        <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <HardDrive size={16} className="text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {storageInfo.fileCount} file{storageInfo.fileCount !== 1 ? 's' : ''} · {formatStorage(storageInfo.totalBytes)} used
              </span>
              <span className="text-gray-400">Stored in browser</span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleBackup}
            disabled={files.length === 0 || backupStatus === 'exporting'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            <Download size={16} />
            {backupStatus === 'exporting' ? 'Exporting…' : 'Backup Library'}
          </button>
          <button
            onClick={() => backupInputRef.current?.click()}
            disabled={backupStatus === 'importing'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-40 active:scale-[0.98]"
          >
            <Upload size={16} />
            {backupStatus === 'importing' ? 'Restoring…' : 'Restore Backup'}
          </button>
          <input ref={backupInputRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
        </div>

        {/* Backup status messages */}
        {backupStatus && typeof backupStatus === 'object' && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
            backupStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600'
          }`}>
            {backupStatus.type === 'success' ? <AlertCircle size={14} /> : <AlertCircle size={14} />}
            {backupStatus.msg}
          </div>
        )}

        <p className="text-[11px] text-gray-400 leading-relaxed">
          <strong>Tip:</strong> Back up your library regularly. Clearing browser data will delete your files.
          Use Backup to export everything as a single .json file you can restore anytime.
        </p>
      </div>
    </div>
  );
};

export default QuickAccessPage;
