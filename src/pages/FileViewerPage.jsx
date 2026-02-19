import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Download, Edit3, Eye, FileText,
  ZoomIn, ZoomOut, RotateCw, Maximize2,
  FileSpreadsheet, Image as ImageIcon, File,
  Info, Copy, Check, Lock, Share2, Printer
} from 'lucide-react';
import PdfViewer from '../components/PdfViewer';
import { getFile, touchLastOpened } from '../lib/storage';
import { getFileTypeLabel, getFileTypeColor } from '../lib/fileParser';

/* ------------------------------------------------------------------ */
/*  Extraction‑limit helpers (free plan: 3 per day)                   */
/* ------------------------------------------------------------------ */
const EXTRACTION_LIMIT = 3;
const EXTRACTION_KEY = 'dochub-extractions';

function getExtractionUsage() {
  try {
    const raw = localStorage.getItem(EXTRACTION_KEY);
    if (!raw) return { date: '', count: 0 };
    return JSON.parse(raw);
  } catch { return { date: '', count: 0 }; }
}

function canExtract() {
  return true; // All features are free — 100% local
}

function recordExtraction() {
  const today = new Date().toISOString().slice(0, 10);
  const usage = getExtractionUsage();
  if (usage.date !== today) {
    localStorage.setItem(EXTRACTION_KEY, JSON.stringify({ date: today, count: 1 }));
  } else {
    localStorage.setItem(EXTRACTION_KEY, JSON.stringify({ date: today, count: usage.count + 1 }));
  }
}

function remainingExtractions() {
  return Infinity; // Unlimited — all local
}

/* ------------------------------------------------------------------ */
/*  File type helpers                                                  */
/* ------------------------------------------------------------------ */
const TYPE_BADGES = {
  pdf: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'PDF' },
  docx: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Word' },
  txt: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Text' },
  csv: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'CSV' },
  xlsx: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Excel' },
  image: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', label: 'Image' },
  new: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', label: 'Doc' },
};

function getTypeBadge(type) {
  return TYPE_BADGES[type] || TYPE_BADGES.new;
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/* ------------------------------------------------------------------ */
/*  Image sub‑viewer                                                   */
/* ------------------------------------------------------------------ */
const ImageViewer = ({ rawData, fileName }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);

  // Build an object URL from rawData
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!rawData) return;
    const ext = (fileName || '').split('.').pop().toLowerCase();
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', ico: 'image/x-icon' };
    const mime = mimeMap[ext] || 'image/png';
    const blob = new Blob([rawData], { type: mime });
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [rawData, fileName]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
        <button onClick={() => setScale(s => Math.max(0.2, s - 0.2))} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          <ZoomOut size={18} />
        </button>
        <span className="text-xs font-medium tabular-nums min-w-[40px] text-center text-gray-500">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          <ZoomIn size={18} />
        </button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          <RotateCw size={18} />
        </button>
        <button onClick={() => { setScale(1); setRotation(0); }} className="ml-2 px-3 py-1 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Reset</button>
      </div>

      {/* Image */}
      <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 rounded-xl flex items-center justify-center p-8" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
        {src ? (
          <img
            ref={imgRef}
            src={src}
            alt={fileName}
            className="max-w-full transition-transform duration-200 shadow-2xl rounded-lg"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        ) : (
          <p className="text-gray-400">Loading image…</p>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  HTML preview (for DOCX / extracted text)                            */
/* ------------------------------------------------------------------ */
const HtmlPreview = ({ htmlContent }) => (
  <div
    className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 sm:p-12 prose prose-sm max-w-none dark:prose-invert overflow-auto"
    style={{ maxHeight: 'calc(100vh - 16rem)' }}
    dangerouslySetInnerHTML={{ __html: htmlContent }}
  />
);

/* ------------------------------------------------------------------ */
/*  Main FileViewerPage                                                */
/* ------------------------------------------------------------------ */
const FileViewerPage = ({ fileId, onNavigate }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fileId) return;
    (async () => {
      setLoading(true);
      try {
        const doc = await getFile(fileId);
        setFile(doc);
        if (doc) await touchLastOpened(fileId);
      } catch (err) {
        console.error('Failed to load file:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [fileId]);

  const handleExtractAndEdit = () => {
    recordExtraction();
    onNavigate('editor', fileId);
  };

  const handleDownloadOriginal = () => {
    if (!file?.rawData) return;
    const extMap = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv', txt: 'text/plain', image: 'application/octet-stream' };
    const mime = extMap[file.type] || 'application/octet-stream';
    const blob = new Blob([file.rawData], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    if (!file?.htmlContent) return;
    const temp = document.createElement('div');
    temp.innerHTML = file.htmlContent;
    const text = temp.textContent || temp.innerText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <File size={48} className="text-gray-300" />
        <p className="text-gray-500">File not found</p>
        <button onClick={() => onNavigate('quick-access')} className="text-blue-600 hover:underline text-sm">Back to Quick Access</button>
      </div>
    );
  }

  const badge = getTypeBadge(file.type);
  const isViewableAsIs = ['pdf', 'image'].includes(file.type);

  return (
    <>
      <Helmet>
        <title>{file.name} — DocHub Viewer</title>
      </Helmet>

      <div className="flex flex-col gap-4">
        {/* Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => onNavigate('quick-access')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors flex-shrink-0"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</h2>
                <span className={`${badge.bg} ${badge.text} px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0`}>{badge.label}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)} · Opened {new Date(file.lastOpenedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Copy text (for non-PDF / non-image) */}
            {!isViewableAsIs && file.htmlContent && (
              <button onClick={handleCopyText} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            )}

            {/* Download Original */}
            {file.rawData && (
              <button onClick={handleDownloadOriginal} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <Download size={15} />
                Download
              </button>
            )}

            {/* Share */}
            {navigator.share && file.rawData && (
              <button
                onClick={async () => {
                  try {
                    const extMap = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', csv: 'text/csv', txt: 'text/plain', image: 'application/octet-stream' };
                    const mime = extMap[file.type] || 'application/octet-stream';
                    const blob = new Blob([file.rawData], { type: mime });
                    const f = new File([blob], file.name, { type: mime });
                    await navigator.share({ files: [f], title: file.name });
                  } catch (err) { if (err.name !== 'AbortError') console.error(err); }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Share2 size={15} />
                Share
              </button>
            )}

            {/* Print (for PDFs) */}
            {file.type === 'pdf' && file.rawData && (
              <button
                onClick={() => {
                  const blob = new Blob([file.rawData], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = url;
                  document.body.appendChild(iframe);
                  iframe.onload = () => {
                    iframe.contentWindow?.print();
                    setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 1000);
                  };
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Printer size={15} />
                Print
              </button>
            )}

            {/* Extract & Edit */}
            <button
              onClick={handleExtractAndEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Edit3 size={15} />
              Extract & Edit
            </button>
          </div>
        </div>

        {/* Local-only badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-400 text-sm">
          <Lock size={15} className="flex-shrink-0" />
          <span>100% local — this file never leaves your device</span>
        </div>

        {/* File Content */}
        <div className="rounded-2xl overflow-hidden">
          {file.type === 'pdf' && file.rawData ? (
            <PdfViewer rawData={file.rawData} fileName={file.name} />
          ) : file.type === 'image' && file.rawData ? (
            <ImageViewer rawData={file.rawData} fileName={file.name} />
          ) : file.htmlContent ? (
            <HtmlPreview htmlContent={file.htmlContent} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <File size={40} />
              <p className="mt-3">No preview available for this file type</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FileViewerPage;
