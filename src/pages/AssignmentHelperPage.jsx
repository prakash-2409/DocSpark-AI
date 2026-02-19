import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Wand2, Check, FileText, ClipboardList, AlignLeft,
  Heading, List, Upload, ArrowRight
} from 'lucide-react';
import { parseFile } from '../lib/fileParser';
import { saveFile } from '../lib/storage';

/**
 * AssignmentHelperPage — SEO landing page for /assignment-helper.
 * Targets students searching for "assignment formatter" or "format my assignment".
 */
const AssignmentHelperPage = ({ onNavigate }) => {
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

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Assignment Helper — Format & Clean Your Assignments | DocHub</title>
        <meta name="description" content="Instantly format your assignments with proper headings, margins, and clean layout. Fix messy formatting in one click. Free for students." />
        <meta name="keywords" content="assignment helper, format assignment, assignment formatter, clean assignment layout, student assignment tool, fix assignment formatting" />
      </Helmet>

      {/* Hero */}
      <section className="text-center pt-4 pb-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
            <ClipboardList size={16} />
            For Students & Teachers
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Fix Your Assignment Formatting{' '}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              in One Click
            </span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Upload your assignment, click "Format", and get a clean, submission-ready document
            with proper headings, consistent spacing, and standard margins.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all cursor-pointer active:scale-95">
              <Upload size={20} />
              Upload Assignment
              <input type="file" className="hidden" accept=".txt,.doc,.docx,.pdf" onChange={handleImport} />
            </label>
            <button
              onClick={async () => {
                const id = await saveFile({
                  name: 'My Assignment',
                  type: 'new',
                  htmlContent: '<h1>Assignment Title</h1><h2>Introduction</h2><p>Write your introduction here...</p><h2>Main Body</h2><p>Write your main content here...</p><h2>Conclusion</h2><p>Summarise your findings...</p><h2>References</h2><p>List your references...</p>',
                  size: 0,
                });
                onNavigate('editor', id);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300 transition-all"
            >
              <FileText size={20} />
              Start from Template
            </button>
          </div>
        </motion.div>
      </section>

      {/* What it does */}
      <section className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: Heading, title: 'Proper Headings', desc: 'Automatically structures your document with H1 title and H2 sections.' },
          { icon: AlignLeft, title: 'Clean Margins', desc: 'Standard margins and paragraph spacing for submission-ready layout.' },
          { icon: List, title: 'Fix Lists', desc: 'Normalises bullet points and numbered lists for consistency.' },
          { icon: Wand2, title: 'Remove Junk Formatting', desc: 'Strips inline styles, extra spaces, and broken lines in one click.' },
        ].map((f, i) => (
          <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex-shrink-0">
              <f.icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
        <h2>How the Assignment Helper Works</h2>
        <ol>
          <li><strong>Upload or paste</strong> — Open your assignment file (Word, PDF, or Text) or create one from the template.</li>
          <li><strong>Click "Fix" → "Assignment Format"</strong> — In the editor toolbar, click the Fix button and choose "Assignment Format".</li>
          <li><strong>Review & export</strong> — Check the formatted result, make any manual tweaks, then export as PDF or Word.</li>
        </ol>

        <h2>Common Problems This Tool Fixes</h2>
        <ul>
          <li>Double or triple spaces between words</li>
          <li>Lines broken in the middle of sentences (copy-paste artifacts)</li>
          <li>Inconsistent font styles from pasting from multiple sources</li>
          <li>Missing or incorrect heading hierarchy</li>
          <li>Excessive blank lines between paragraphs</li>
        </ul>

        <h3>Who Is This For?</h3>
        <p>
          This tool is built specifically for students who need to submit clean, well-formatted
          assignments but don't have time to manually fix formatting issues. Whether you're
          working on an essay, lab report, or research paper — upload it, clean it, and export it.
        </p>

        <h3>FAQ</h3>
        <h4>Does it change my content?</h4>
        <p>No. The Assignment Helper only changes formatting (headings, spacing, styles). Your actual text content stays the same.</p>

        <h4>Can I use this for essays and reports?</h4>
        <p>Absolutely. It works great for any text-heavy academic document.</p>
      </section>
    </div>
  );
};

export default AssignmentHelperPage;
