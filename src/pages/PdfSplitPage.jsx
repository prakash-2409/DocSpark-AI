import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, AlertCircle, Check, X,
  FileText, Scissors, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import { trackAndStamp } from '../lib/exportLimit';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * PdfSplitPage — extract specific pages from a PDF.
 *
 * Users select which pages to include, then download a new PDF with only those pages.
 */
const PdfSplitPage = ({ onNavigate }) => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);       // { num, thumbnail, selected }
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const pdfDocRef = useRef(null);

  const loadPdf = useCallback(async (f) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const rawData = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data: rawData.slice() }).promise;
      pdfDocRef.current = { doc, rawData };

      // Generate thumbnails
      const pageItems = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageItems.push({
          num: i,
          thumbnail: canvas.toDataURL('image/jpeg', 0.5),
          selected: true,
        });
      }

      setFile({ name: f.name, numPages: doc.numPages, size: f.size });
      setPages(pageItems);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) loadPdf(e.target.files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) loadPdf(e.dataTransfer.files[0]);
  };

  const togglePage = (num) => {
    setPages(prev => prev.map(p => p.num === num ? { ...p, selected: !p.selected } : p));
  };

  const selectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: true })));
  const deselectAll = () => setPages(prev => prev.map(p => ({ ...p, selected: false })));
  const invertSelection = () => setPages(prev => prev.map(p => ({ ...p, selected: !p.selected })));

  const selectedPages = pages.filter(p => p.selected);

  // Extract selected pages into a new PDF
  const handleExtract = async () => {
    if (selectedPages.length === 0) {
      setError('Select at least one page.');
      return;
    }
    if (!pdfDocRef.current) return;

    setExtracting(true);
    setError(null);
    setSuccess(false);

    try {
      const { doc, rawData } = pdfDocRef.current;
      let newDoc = null;

      for (const p of selectedPages) {
        const page = await doc.getPage(p.num);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdfW = viewport.width * 0.75;
        const pdfH = viewport.height * 0.75;

        if (!newDoc) {
          newDoc = new jsPDF({
            orientation: pdfW > pdfH ? 'landscape' : 'portrait',
            unit: 'pt',
            format: [pdfW, pdfH],
          });
        } else {
          newDoc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
        }

        newDoc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      if (newDoc) {
        trackAndStamp(newDoc);
        newDoc.save(file.name.replace(/\.pdf$/i, '') + `-pages-${selectedPages.map(p => p.num).join('-')}.pdf`);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Extract failed:', err);
      setError('Failed to extract pages.');
    } finally {
      setExtracting(false);
    }
  };

  const handleShare = async () => {
    if (selectedPages.length === 0 || !pdfDocRef.current || !navigator.share) return;

    setExtracting(true);
    try {
      const { doc } = pdfDocRef.current;
      let newDoc = null;

      for (const p of selectedPages) {
        const page = await doc.getPage(p.num);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdfW = viewport.width * 0.75;
        const pdfH = viewport.height * 0.75;

        if (!newDoc) {
          newDoc = new jsPDF({ orientation: pdfW > pdfH ? 'landscape' : 'portrait', unit: 'pt', format: [pdfW, pdfH] });
        } else {
          newDoc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
        }
        newDoc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }

      if (newDoc) {
        const blob = newDoc.output('blob');
        const f = new File([blob], 'extracted-pages.pdf', { type: 'application/pdf' });
        await navigator.share({ files: [f], title: 'Extracted PDF Pages' });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setSuccess(false);
    setError(null);
    pdfDocRef.current = null;
  };

  return (
    <>
      <Helmet><title>Split PDF — Extract Pages | DocHub</title></Helmet>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto"
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 mb-4">
            <Scissors size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Split PDF</h1>
          <p className="text-gray-500 dark:text-gray-400">Select specific pages to extract into a new PDF. Free & private.</p>
        </div>

        {/* Upload */}
        {!file && !loading && (
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${isDragging ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-orange-300 bg-white dark:bg-gray-900'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click or drag a PDF file here</p>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">Loading pages…</p>
          </div>
        )}

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-sm">
              <Check size={16} /> Pages extracted & downloaded!
              <button onClick={() => setSuccess(false)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Grid */}
        {file && pages.length > 0 && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {file.name} · {file.numPages} pages
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Select All</button>
                <button onClick={deselectAll} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Deselect All</button>
                <button onClick={invertSelection} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Invert</button>
                <button onClick={reset} className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Change File</button>
              </div>
            </div>

            {/* Pages */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {pages.map((page) => (
                <button
                  key={page.num}
                  onClick={() => togglePage(page.num)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all group
                    ${page.selected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 opacity-50 hover:opacity-75'}`}
                >
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                    <img src={page.thumbnail} alt={`Page ${page.num}`} className="w-full h-full object-contain" />
                  </div>
                  {/* Page number */}
                  <div className={`py-1.5 text-xs font-semibold text-center transition-colors
                    ${page.selected ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {page.num}
                  </div>
                  {/* Checkmark */}
                  {page.selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Summary + extract */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-sm text-gray-500 flex-1">
                {selectedPages.length} of {pages.length} pages selected
              </p>
              <div className="flex gap-2">
                {navigator.share && (
                  <button
                    onClick={handleShare}
                    disabled={extracting || selectedPages.length === 0}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={handleExtract}
                  disabled={extracting || selectedPages.length === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  {extracting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Extracting…
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Extract {selectedPages.length} Page{selectedPages.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        {!file && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {[
              { step: '1', title: 'Upload PDF', desc: 'Select a PDF file' },
              { step: '2', title: 'Pick Pages', desc: 'Click pages to select/deselect' },
              { step: '3', title: 'Download', desc: 'Get your extracted pages' },
            ].map(item => (
              <div key={item.step} className="text-center p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PdfSplitPage;
