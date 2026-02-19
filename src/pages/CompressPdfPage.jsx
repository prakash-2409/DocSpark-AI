import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, AlertCircle, Check, X,
  FileText, ArrowRight, Minimize2, Gauge, Target, Share2
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import { stampWatermark, incrementExportCount } from '../lib/exportLimit';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * CompressPdfPage — reduce PDF file size.
 *
 * Strategy: re-render every page to canvas, then re-build PDF with
 * JPEG compression at a user-chosen quality setting OR a custom target KB.
 */
const CompressPdfPage = ({ onNavigate }) => {
  const [file, setFile] = useState(null);       // { name, rawData, numPages, size }
  const [quality, setQuality] = useState('medium');
  const [targetKb, setTargetKb] = useState('');   // custom target in KB
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState(null);    // { blob, size, savings }
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const QUALITY_MAP = {
    low:    { jpeg: 0.4, scale: 1.0, label: 'Low (smallest file)' },
    medium: { jpeg: 0.65, scale: 1.5, label: 'Medium (balanced)' },
    high:   { jpeg: 0.82, scale: 2.0, label: 'High (best quality)' },
  };

  const loadFile = useCallback(async (f) => {
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setError(null);
    setResult(null);

    try {
      const rawData = new Uint8Array(await f.arrayBuffer());
      const doc = await pdfjsLib.getDocument({ data: rawData.slice() }).promise;
      setFile({ name: f.name, rawData, numPages: doc.numPages, size: f.size });
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF. It may be corrupted or encrypted.');
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) loadFile(e.dataTransfer.files[0]);
  };

  const handleCompress = async () => {
    if (!file) return;
    setCompressing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const pdfDoc = await pdfjsLib.getDocument({ data: file.rawData.slice() }).promise;

      // Pre-render all pages to canvases at a good scale
      setProgress(5);
      const pageCanvases = [];
      const renderScale = quality === 'custom' ? 1.5 : QUALITY_MAP[quality].scale;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setProgress(Math.round(5 + (i / pdfDoc.numPages) * 45));
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageCanvases.push({ canvas, width: viewport.width, height: viewport.height });
      }

      // Build PDF at a given JPEG quality
      const buildPdf = (jpegQuality) => {
        let doc = null;
        for (const pc of pageCanvases) {
          const imgData = pc.canvas.toDataURL('image/jpeg', jpegQuality);
          const pdfW = pc.width * 0.75;
          const pdfH = pc.height * 0.75;
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
        if (doc) stampWatermark(doc);
        return doc ? doc.output('blob') : null;
      };

      let finalBlob;

      if (quality === 'custom' && targetKb) {
        // Binary search for JPEG quality that meets the target size
        const targetBytes = parseFloat(targetKb) * 1024;
        let lo = 0.05, hi = 0.95, bestBlob = null;

        setProgress(55);
        for (let iter = 0; iter < 8; iter++) {
          const mid = (lo + hi) / 2;
          const blob = buildPdf(mid);
          setProgress(55 + Math.round(((iter + 1) / 8) * 40));

          if (blob.size <= targetBytes) {
            bestBlob = blob;
            lo = mid + 0.01; // try higher quality
          } else {
            hi = mid - 0.01; // need lower quality
          }
        }

        // Final pass at lowest if nothing fits
        if (!bestBlob) {
          bestBlob = buildPdf(0.05);
          if (bestBlob.size > targetBytes) {
            setError(`Couldn't reach ${targetKb} KB — minimum achievable is ${(bestBlob.size / 1024).toFixed(0)} KB. Downloading best result.`);
          }
        }
        finalBlob = bestBlob;
      } else {
        // Preset quality
        setProgress(55);
        const q = QUALITY_MAP[quality];
        finalBlob = buildPdf(q.jpeg);
        setProgress(95);
      }

      if (finalBlob) {
        const savings = Math.max(0, Math.round(((file.size - finalBlob.size) / file.size) * 100));
        setResult({ blob: finalBlob, size: finalBlob.size, savings });
      }
    } catch (err) {
      console.error('Compression failed:', err);
      setError('Compression failed. The file may be corrupted.');
    } finally {
      setCompressing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    incrementExportCount();
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!result || !navigator.share) return;
    try {
      const f = new File([result.blob], file.name.replace(/\.pdf$/i, '') + '-compressed.pdf', { type: 'application/pdf' });
      await navigator.share({ files: [f], title: 'Compressed PDF', text: 'Compressed with DocHub' });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <Helmet><title>Compress PDF — DocHub</title></Helmet>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto"
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
            <Minimize2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Compress PDF</h1>
          <p className="text-gray-500 dark:text-gray-400">Reduce PDF file size for easy sharing. Free, private, no uploads.</p>
        </div>

        {/* Upload */}
        {!file && (
          <div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${isDragging ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-300 bg-white dark:bg-gray-900'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click or drag a PDF file here</p>
            <p className="text-xs text-gray-400 mt-1">Only .pdf files</p>
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* File loaded — options */}
        {file && !result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* File info */}
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{file.numPages} pages · {formatSize(file.size)}</p>
              </div>
              <button onClick={() => { setFile(null); setResult(null); }} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Quality selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Compression Level</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(QUALITY_MAP).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setQuality(key)}
                    className={`p-3 rounded-xl border text-center transition-all text-sm
                      ${quality === key
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <p className="font-semibold capitalize">{key}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{key === 'low' ? 'Max compression' : key === 'medium' ? 'Balanced' : 'Best quality'}</p>
                  </button>
                ))}
                <button
                  onClick={() => setQuality('custom')}
                  className={`p-3 rounded-xl border text-center transition-all text-sm
                    ${quality === 'custom'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <p className="font-semibold flex items-center justify-center gap-1"><Target size={13} /> Custom</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Set target KB</p>
                </button>
              </div>
            </div>

            {/* Custom target KB input */}
            {quality === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Target File Size</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={targetKb}
                      onChange={(e) => setTargetKb(e.target.value)}
                      placeholder={`e.g. ${Math.round(file.size / 1024 / 2)}`}
                      className="w-full px-4 py-3 pr-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">KB</span>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0 text-right">
                    <p>Current: {(file.size / 1024).toFixed(0)} KB</p>
                    {targetKb && <p className="text-emerald-500 font-medium">{Math.max(0, Math.round(((file.size / 1024 - parseFloat(targetKb)) / (file.size / 1024)) * 100))}% reduction</p>}
                  </div>
                </div>
                {targetKb && parseFloat(targetKb) < 10 && (
                  <p className="text-xs text-amber-500">Very small targets may result in poor quality.</p>
                )}
              </motion.div>
            )}

            {/* Compress button */}
            <button
              onClick={handleCompress}
              disabled={compressing || (quality === 'custom' && (!targetKb || parseFloat(targetKb) <= 0))}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {compressing ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Compressing… {progress}%
                </>
              ) : (
                <>
                  <Minimize2 size={18} />
                  Compress PDF
                </>
              )}
            </button>

            {/* Progress bar */}
            {compressing && (
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear' }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            {/* Savings card */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 mb-3">
                <Check size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compressed!</h3>
              <div className="flex items-center justify-center gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Original</p>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">{formatSize(file.size)}</p>
                </div>
                <ArrowRight size={18} className="text-emerald-500" />
                <div>
                  <p className="text-gray-500">Compressed</p>
                  <p className="font-semibold text-emerald-600">{formatSize(result.size)}</p>
                </div>
              </div>
              <p className="text-emerald-600 font-bold text-lg">{result.savings}% smaller</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]"
              >
                <Download size={18} />
                Download
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowRight size={18} />
                  Share
                </button>
              )}
            </div>

            {/* Compress another */}
            <button
              onClick={() => { setFile(null); setResult(null); }}
              className="w-full text-center text-sm text-gray-500 hover:text-emerald-600 transition-colors py-2"
            >
              Compress another PDF
            </button>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {!file && !result && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {[
              { step: '1', title: 'Upload', desc: 'Select your PDF file' },
              { step: '2', title: 'Choose Quality', desc: 'Low, Medium, High, or enter exact KB' },
              { step: '3', title: 'Download', desc: 'Get your smaller PDF' },
            ].map(item => (
              <div key={item.step} className="text-center p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-bold text-lg">
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

export default CompressPdfPage;
