import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Upload, FolderOpen, Shield, Zap, Wifi, WifiOff,
  ArrowRight, Clock, Smartphone, Globe, Lock, Sparkles,
  FileSpreadsheet, File as FileIcon, Image as ImageIcon
} from 'lucide-react';
import { getAllFiles, saveFile } from '../lib/storage';
import { parseFile } from '../lib/fileParser';
import { getFileTypeColor } from '../lib/fileParser';

/**
 * HomePage — landing / dashboard.
 * 
 * Shows recent documents, quick actions, and feature highlights.
 * This is the first thing users see when they open the app.
 */
const HomePage = ({ onNavigate }) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    try {
      const all = await getAllFiles();
      setRecentFiles(all.slice(0, 6)); // Show last 6
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewDocument = async () => {
    const id = await saveFile({
      name: 'Untitled Document',
      type: 'new',
      htmlContent: '<p></p>',
      size: 0,
    });
    onNavigate('editor', id);
  };

  const handleImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseFile(file);
      const id = await saveFile({
        name: file.name,
        type: parsed.type,
        rawData: parsed.rawData,
        htmlContent: parsed.htmlContent,
        size: file.size,
      });
      // PDFs and images → viewer (render as-is); others → editor
      const viewerTypes = ['pdf', 'image'];
      onNavigate(viewerTypes.includes(parsed.type) ? 'file-viewer' : 'editor', id);
    } catch (err) {
      console.error('Import failed:', err);
      alert('Failed to import file. Please try a supported format.');
    }
    e.target.value = '';
  }, [onNavigate]);

  const getIcon = (type) => {
    switch (type) {
      case 'csv':
      case 'xlsx': return FileSpreadsheet;
      case 'image': return ImageIcon;
      case 'pdf':
      case 'docx':
      case 'txt': return FileText;
      default: return FileIcon;
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const features = [
    {
      icon: FileText,
      title: 'Open Any File',
      desc: 'PDF, Word, Excel, CSV, Images — all render as-is in one app',
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      icon: Lock,
      title: '100% Private',
      desc: 'Files never leave your device. No cloud, no tracking.',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      desc: 'No internet needed once loaded. Perfect for exams.',
      color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    },
    {
      icon: Zap,
      title: 'PDF Tools',
      desc: 'Merge PDFs, convert images to PDF, extract text, and more.',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
    {
      icon: Sparkles,
      title: 'Assignment Helper',
      desc: 'One-click formatting for clean, submission-ready docs.',
      color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      desc: 'Use on phone or desktop. Add to home screen as app.',
      color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Section */}
      <section className="text-center pt-4 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            One app for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              all your documents
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Open, edit, fix, and export any document — locally, privately, and fast.
            No installs, no sign-ups, no cloud uploads.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleNewDocument}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all active:scale-95"
            >
              <Plus size={20} />
              New Document
            </button>
            <label className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer active:scale-95">
              <Upload size={20} />
              Open a File
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.doc,.docx,.pdf,.csv,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp"
                onChange={handleImport}
              />
            </label>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Supports PDF, DOCX, TXT, CSV, XLSX, Images &middot; Everything stays on your device
          </p>
        </motion.div>
      </section>

      {/* Recent Documents */}
      {!loading && recentFiles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              Recent Documents
            </h2>
            <button
              onClick={() => onNavigate('quick-access')}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentFiles.map((file) => {
              const Icon = getIcon(file.type);
              const color = getFileTypeColor(file.type);
              return (
                <button
                  key={file.id}
                  onClick={() => {
                    const viewerTypes = ['pdf', 'image'];
                    onNavigate(viewerTypes.includes(file.type) ? 'file-viewer' : 'editor', file.id);
                  }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left group"
                >
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${color} flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {formatTime(file.lastOpenedAt)}
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Feature Grid */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
          Why students and teachers love DocHub
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${f.color} flex items-center justify-center mb-3`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-8 py-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Open any document right in your browser. No sign-up needed.
            Your files stay yours — always.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleNewDocument}
              className="px-6 py-3 rounded-xl font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
            >
              Create a Document
            </button>
            <button
              onClick={() => onNavigate('quick-access')}
              className="px-6 py-3 rounded-xl font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
            >
              Browse Files
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
