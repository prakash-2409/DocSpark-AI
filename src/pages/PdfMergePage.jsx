import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Upload, Trash2, GripVertical, FileText, Download,
  Plus, AlertCircle, Check, Merge, X, MoveUp, MoveDown
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import { trackAndStamp } from '../lib/exportLimit';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * PdfMergePage — merge multiple PDF files into one.
 *
 * Flow:
 *  1. Add multiple PDF files (by file picker or drag-and-drop)
 *  2. Reorder them by drag or arrows
 *  3. Click "Merge" — renders every page to canvas, then builds a new PDF via jsPDF
 *  4. Download the merged PDF
 */
const PdfMergePage = ({ onNavigate }) => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Add PDF files
  const addFiles = useCallback(async (fileList) => {
    setError(null);
    setSuccess(false);
    const newPdfs = [];

    for (const file of fileList) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are supported for merging.');
        continue;
      }

      try {
        const rawData = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjsLib.getDocument({ data: rawData.slice() }).promise;

        // Generate thumbnail of first page
        const page = await doc.getPage(1);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const thumbnail = canvas.toDataURL('image/jpeg', 0.6);

        newPdfs.push({
          id: crypto.randomUUID(),
          name: file.name,
          numPages: doc.numPages,
          rawData,
          thumbnail,
          size: file.size,
        });
      } catch (err) {
        console.error('Failed to load PDF:', file.name, err);
        setError(`Failed to load "${file.name}". The file may be corrupted or encrypted.`);
      }
    }

    setPdfFiles(prev => [...prev, ...newPdfs]);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.length) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (id) => setPdfFiles(prev => prev.filter(f => f.id !== id));
  const moveFile = (id, dir) => {
    setPdfFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // Merge all PDFs
  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setError('Add at least 2 PDF files to merge.');
      return;
    }

    setMerging(true);
    setError(null);
    setSuccess(false);

    try {
      let doc = null;

      for (const pdfFile of pdfFiles) {
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfFile.rawData.slice() }).promise;

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 2 }); // High quality

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;

          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          const pdfW = viewport.width * 0.75; // px to pt (roughly)
          const pdfH = viewport.height * 0.75;

          if (!doc) {
            doc = new jsPDF({
              orientation: pdfW > pdfH ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [pdfW, pdfH],
            });
          } else {
            doc.addPage([pdfW, pdfH], pdfW > pdfH ? 'landscape' : 'portrait');
          }

          doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
        }
      }

      if (doc) {
        trackAndStamp(doc);
        doc.save('merged-document.pdf');
        setSuccess(true);
      }
    } catch (err) {
      console.error('Merge failed:', err);
      setError('Merge failed. One of the files may be corrupted.');
    } finally {
      setMerging(false);
    }
  };

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.numPages, 0);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <Helmet>
        <title>Merge PDFs — DocHub</title>
      </Helmet>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
            <Merge size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Merge PDFs</h1>
          <p className="text-gray-500 dark:text-gray-400">Combine multiple PDF files into a single document. Free, private, no uploads.</p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-900'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop PDF files here' : 'Click or drag PDF files here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Only .pdf files are supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-sm">
              <Check size={16} />
              Merged PDF downloaded successfully!
              <button onClick={() => setSuccess(false)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File List */}
        {pdfFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {pdfFiles.length} file{pdfFiles.length !== 1 ? 's' : ''} · {totalPages} page{totalPages !== 1 ? 's' : ''} total
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Plus size={14} /> Add more
              </button>
            </div>

            <div className="space-y-2">
              {pdfFiles.map((pdf, index) => (
                <motion.div
                  key={pdf.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 group"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 shadow-sm">
                    {pdf.thumbnail && (
                      <img src={pdf.thumbnail} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{pdf.name}</p>
                    <p className="text-xs text-gray-400">{pdf.numPages} page{pdf.numPages !== 1 ? 's' : ''} · {formatSize(pdf.size)}</p>
                  </div>

                  {/* Ordering */}
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    #{index + 1}
                  </span>

                  {/* Move / Remove */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveFile(pdf.id, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-30 transition-all"
                      title="Move up"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      onClick={() => moveFile(pdf.id, 1)}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-30 transition-all"
                      title="Move down"
                    >
                      <MoveDown size={14} />
                    </button>
                    <button
                      onClick={() => removeFile(pdf.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Merge Button */}
            <button
              onClick={handleMerge}
              disabled={merging || pdfFiles.length < 2}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {merging ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Merging…
                </>
              ) : (
                <>
                  <Download size={18} />
                  Merge & Download
                </>
              )}
            </button>
          </div>
        )}

        {/* How it works */}
        {pdfFiles.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { step: '1', title: 'Add PDFs', desc: 'Upload or drag your PDF files' },
              { step: '2', title: 'Reorder', desc: 'Arrange them in the desired order' },
              { step: '3', title: 'Download', desc: 'Get your merged PDF instantly' },
            ].map(item => (
              <div key={item.step} className="text-center p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-bold text-lg">
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

export default PdfMergePage;
