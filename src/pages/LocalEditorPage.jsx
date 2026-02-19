import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Shield, Globe, Smartphone, Lock,
  Check, Zap, WifiOff, ArrowRight
} from 'lucide-react';
import { parseFile } from '../lib/fileParser';
import { saveFile } from '../lib/storage';

/**
 * LocalEditorPage — SEO landing page for /local-document-editor.
 * Targets "local document editor" / "offline document editor" queries.
 */
const LocalEditorPage = ({ onNavigate }) => {
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
      onNavigate('editor', id);
    } catch (err) {
      alert('Failed to open file.');
    }
    e.target.value = '';
  }, [onNavigate]);

  const handleNew = async () => {
    const id = await saveFile({
      name: 'Untitled Document',
      type: 'new',
      htmlContent: '<p></p>',
      size: 0,
    });
    onNavigate('editor', id);
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Local Document Editor — Edit Files Offline & Privately | DocHub</title>
        <meta name="description" content="A privacy-first local document editor. Open, edit, and export documents without uploading to any server. Works offline. Supports PDF, Word, Excel, CSV, and Text files." />
        <meta name="keywords" content="local document editor, offline document editor, privacy first editor, no cloud editor, edit documents offline, private document editor" />
      </Helmet>

      {/* Hero */}
      <section className="text-center pt-4 pb-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
            <Lock size={16} />
            100% Local & Private
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            The Document Editor That{' '}
            <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Never Uploads Your Files
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Edit any document type in your browser. Your files are stored on your device only.
            Works offline, no account needed, no data collection.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25 transition-all active:scale-95"
            >
              <FileText size={20} />
              Start Editing
            </button>
            <label className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300 transition-all cursor-pointer active:scale-95">
              <Upload size={20} />
              Open a File
              <input type="file" className="hidden" accept=".txt,.doc,.docx,.pdf,.csv,.xls,.xlsx" onChange={handleImport} />
            </label>
          </div>
        </motion.div>
      </section>

      {/* Privacy Promise */}
      <section className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/10 dark:to-teal-900/10 rounded-2xl p-8 border border-green-100 dark:border-green-900/30">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">Our Privacy Promise</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: 'No Cloud Storage', desc: 'Files are saved in your browser\'s local storage (IndexedDB). We don\'t operate any cloud storage.' },
            { icon: Shield, title: 'No Server Uploads', desc: 'File parsing, editing, and exporting all happen in your browser. Nothing is sent to any server.' },
            { icon: WifiOff, title: 'Works Offline', desc: 'Once loaded, DocHub works without internet. Perfect for low-connectivity situations or exams.' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mx-auto mb-3">
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
        <h2>What is a Local Document Editor?</h2>
        <p>
          A local document editor is a tool that lets you create, open, and edit documents
          entirely within your browser — without uploading anything to a remote server.
          Unlike Google Docs or Microsoft 365 Online, your data stays on your device at all times.
        </p>

        <h3>Supported File Types</h3>
        <ul>
          <li><strong>PDF</strong> — Extract text from PDFs, edit, and re-export</li>
          <li><strong>Word (DOCX)</strong> — Open Word documents with formatting preserved</li>
          <li><strong>Excel / CSV</strong> — View and edit spreadsheet data as tables</li>
          <li><strong>Text (TXT)</strong> — Plain text files</li>
        </ul>

        <h3>Who Needs a Local Editor?</h3>
        <ul>
          <li>Students who need to quickly edit assignments without installing Word</li>
          <li>Teachers who want to review documents without cloud tools</li>
          <li>Anyone in a low-internet environment (cafes, transit, rural areas)</li>
          <li>Privacy-conscious users who don't want their documents on someone else's server</li>
        </ul>

        <h3>How Is This Different from Google Docs?</h3>
        <p>
          Google Docs requires an internet connection and stores your files on Google's servers.
          DocHub stores everything locally in your browser. No sign-up, no tracking, no cloud dependency.
          You can even add it to your home screen and use it like a native app.
        </p>
      </section>
    </div>
  );
};

export default LocalEditorPage;
