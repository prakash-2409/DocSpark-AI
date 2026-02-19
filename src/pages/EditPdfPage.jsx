import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Shield, Zap, Check, Edit3, Eye,
  Highlighter, StickyNote, ArrowRight, Merge, Image as ImageIcon
} from 'lucide-react';
import { parseFile } from '../lib/fileParser';
import { saveFile } from '../lib/storage';

/**
 * EditPdfPage — PDF Tools landing page.
 * Opens PDFs in the as-is viewer (FileViewerPage), not the text editor.
 */
const EditPdfPage = ({ onNavigate }) => {
  const handleImportPdf = useCallback(async (e) => {
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
      // Open in file viewer (renders PDF as-is on canvas)
      onNavigate('file-viewer', id);
    } catch (err) {
      alert('Failed to open PDF. It may be corrupted or encrypted.');
    }
    e.target.value = '';
  }, [onNavigate]);

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>PDF Viewer & Tools — Open, View & Edit PDFs | DocHub</title>
        <meta name="description" content="Open and view PDF documents as-is with full visual fidelity. Extract text, merge PDFs, convert images to PDF — all locally and privately." />
      </Helmet>

      {/* Hero */}
      <section className="text-center pt-4 pb-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/25 mb-4">
            <Eye size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Open & View PDFs{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              As-Is
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            View any PDF with full visual fidelity — exactly as it was designed.
            Optionally extract text for editing. Everything stays on your device.
          </p>

          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-95">
            <Upload size={20} />
            Open a PDF File
            <input type="file" className="hidden" accept=".pdf" onChange={handleImportPdf} />
          </label>
          <p className="mt-3 text-xs text-gray-400">No sign-up required &middot; Files never leave your device</p>
        </motion.div>
      </section>

      {/* Quick Tools */}
      <section className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('pdf-merge')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Merge size={24} className="text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Merge PDFs</h3>
            <p className="text-xs text-gray-500">Combine multiple PDFs into one</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('image-to-pdf')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ImageIcon size={24} className="text-purple-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Image to PDF</h3>
            <p className="text-xs text-gray-500">Convert images to PDF document</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('word-to-pdf')}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-800 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText size={24} className="text-sky-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Word to PDF</h3>
            <p className="text-xs text-gray-500">Convert DOCX files to PDF</p>
          </div>
        </button>
      </section>

      {/* Features */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Eye, title: 'View As-Is', desc: 'PDF renders exactly as designed — no layout changes.' },
          { icon: Edit3, title: 'Extract & Edit', desc: 'Optional text extraction for editing in the rich editor.' },
          { icon: Highlighter, title: 'Full Zoom & Navigate', desc: 'Zoom in/out, rotate, and navigate through all pages.' },
          { icon: Shield, title: 'Private & Secure', desc: 'Your PDF never leaves your browser. Zero server uploads.' },
          { icon: Zap, title: 'Instant Rendering', desc: 'Pages render in milliseconds using GPU-accelerated canvas.' },
          { icon: FileText, title: 'Export Options', desc: 'Download original file or extract text to editor.' },
        ].map((f, i) => (
          <div key={i} className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <f.icon size={22} className="text-red-500 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* SEO Content */}
      <section className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
        <h2>How It Works</h2>
        <ol>
          <li><strong>Open your PDF</strong> — Click the button above to select a PDF file from your device.</li>
          <li><strong>View as-is</strong> — Your PDF renders with full visual fidelity — fonts, images, layouts preserved.</li>
          <li><strong>Extract text (optional)</strong> — Click "Extract & Edit" to pull text into the rich text editor.</li>
        </ol>

        <h2>Why DocHub?</h2>
        <p>
          Most online PDF tools require cloud uploads. DocHub processes everything locally in your browser.
          Your files never leave your device — perfect for sensitive documents, assignments, and research papers.
        </p>

        <h3>FAQ</h3>
        <h4>Do PDFs look the same as in Acrobat?</h4>
        <p>Yes — DocHub renders each PDF page on a high-DPI canvas for pixel-perfect display.</p>

        <h4>Can I extract text from scanned PDFs?</h4>
        <p>Text extraction works on text-based PDFs. Scanned (image-based) PDFs need OCR first.</p>

        <h4>Is this really free?</h4>
        <p>Yes. Viewing PDFs is unlimited and free. Text extraction has a daily free limit with unlimited access on Pro.</p>
      </section>
    </div>
  );
};

export default EditPdfPage;
