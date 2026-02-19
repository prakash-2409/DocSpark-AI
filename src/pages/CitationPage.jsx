import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Copy, Plus, Trash2, Download,
  FileText, Globe, BookMarked, Users, Check
} from 'lucide-react';
import { generateCitation, FORMATS } from '../lib/citations';

const SOURCE_TYPES = [
  { id: 'book', label: 'Book', icon: BookMarked },
  { id: 'journal', label: 'Journal Article', icon: FileText },
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'conference', label: 'Conference Paper', icon: Users },
];

const emptyEntry = () => ({
  id: Date.now(),
  type: 'book',
  authors: '',
  title: '',
  year: '',
  publisher: '',
  journal: '',
  volume: '',
  issue: '',
  pages: '',
  url: '',
  accessDate: '',
  doi: '',
  edition: '',
  city: '',
});

const CitationPage = () => {
  const [entries, setEntries] = useState([emptyEntry()]);
  const [activeFormat, setActiveFormat] = useState('APA 7th');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const updateEntry = (id, field, value) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addEntry = () => setEntries(prev => [...prev, emptyEntry()]);

  const removeEntry = (id) => {
    if (entries.length === 1) return;
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const copyToClipboard = useCallback(async (html, id) => {
    const plain = html.replace(/<[^>]+>/g, '');
    try {
      await navigator.clipboard.writeText(plain);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* ignore */ }
  }, []);

  const copyAll = useCallback(async () => {
    const all = entries
      .filter(e => e.title)
      .map(e => generateCitation(e, activeFormat).replace(/<[^>]+>/g, ''))
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(all);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch { /* ignore */ }
  }, [entries, activeFormat]);

  const exportAsTxt = () => {
    const all = entries
      .filter(e => e.title)
      .map(e => generateCitation(e, activeFormat).replace(/<[^>]+>/g, ''))
      .join('\n\n');
    const blob = new Blob([`References (${activeFormat})\n${'='.repeat(40)}\n\n${all}`], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `references-${activeFormat.toLowerCase().replace(/\s/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet><title>Citation Generator — DocHub</title></Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-blue-500" size={24} />
            Citation Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Generate properly formatted references in seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyAll} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {copiedAll ? <Check size={15} /> : <Copy size={15} />}
            {copiedAll ? 'Copied!' : 'Copy All'}
          </button>
          <button onClick={exportAsTxt} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <Download size={15} /> Export .txt
          </button>
        </div>
      </div>

      {/* Format selector */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6 overflow-x-auto">
        {FORMATS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFormat(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeFormat === f
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-6">
        <AnimatePresence>
          {entries.map((entry, idx) => {
            const citation = entry.title ? generateCitation(entry, activeFormat) : '';

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Entry header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Source #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {/* Source type selector */}
                    <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-0.5">
                      {SOURCE_TYPES.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => updateEntry(entry.id, 'type', id)}
                          title={label}
                          className={`p-1.5 rounded-lg transition-all ${
                            entry.type === id
                              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          <Icon size={15} />
                        </button>
                      ))}
                    </div>
                    {entries.length > 1 && (
                      <button onClick={() => removeEntry(entry.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields  */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Author(s)" placeholder="Smith, John; Doe, Jane" value={entry.authors} onChange={v => updateEntry(entry.id, 'authors', v)} full />
                  <Field label="Title" placeholder="Title of the work" value={entry.title} onChange={v => updateEntry(entry.id, 'title', v)} full />
                  <Field label="Year" placeholder="2024" value={entry.year} onChange={v => updateEntry(entry.id, 'year', v)} />
                  {(entry.type === 'book' || entry.type === 'conference') && (
                    <Field label="Publisher" placeholder="Publisher name" value={entry.publisher} onChange={v => updateEntry(entry.id, 'publisher', v)} />
                  )}
                  {entry.type === 'journal' && (
                    <>
                      <Field label="Journal" placeholder="Journal name" value={entry.journal} onChange={v => updateEntry(entry.id, 'journal', v)} />
                      <Field label="Volume" placeholder="12" value={entry.volume} onChange={v => updateEntry(entry.id, 'volume', v)} />
                      <Field label="Issue" placeholder="3" value={entry.issue} onChange={v => updateEntry(entry.id, 'issue', v)} />
                      <Field label="Pages" placeholder="45-67" value={entry.pages} onChange={v => updateEntry(entry.id, 'pages', v)} />
                    </>
                  )}
                  {entry.type === 'website' && (
                    <>
                      <Field label="URL" placeholder="https://example.com" value={entry.url} onChange={v => updateEntry(entry.id, 'url', v)} full />
                      <Field label="Access Date" placeholder="Dec 5, 2024" value={entry.accessDate} onChange={v => updateEntry(entry.id, 'accessDate', v)} />
                    </>
                  )}
                  <Field label="DOI" placeholder="10.xxxx/xxxxx" value={entry.doi} onChange={v => updateEntry(entry.id, 'doi', v)} />
                  {entry.type === 'book' && (
                    <>
                      <Field label="Edition" placeholder="3rd" value={entry.edition} onChange={v => updateEntry(entry.id, 'edition', v)} />
                      <Field label="City" placeholder="New York" value={entry.city} onChange={v => updateEntry(entry.id, 'city', v)} />
                    </>
                  )}
                </div>

                {/* Preview */}
                {citation && (
                  <div className="px-5 pb-5">
                    <div className="flex items-start justify-between gap-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl p-4 border border-blue-100 dark:border-blue-500/20">
                      <p
                        className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed flex-1"
                        dangerouslySetInnerHTML={{ __html: citation }}
                      />
                      <button
                        onClick={() => copyToClipboard(citation, entry.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 text-xs font-medium shrink-0"
                      >
                        {copiedId === entry.id ? <Check size={13} /> : <Copy size={13} />}
                        {copiedId === entry.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add source */}
      <button
        onClick={addEntry}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
      >
        <Plus size={18} /> Add Another Source
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Helper: Form field                                                 */
/* ------------------------------------------------------------------ */
const Field = ({ label, placeholder, value, onChange, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
    />
  </div>
);

export default CitationPage;
