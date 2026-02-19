import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Maximize, Minimize, RotateCw, Moon, Sun, Printer, Share2
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * PdfViewer — renders a PDF as actual pages on <canvas> elements.
 * Supports zoom, page navigation, rotation, and fullscreen.
 *
 * @param {{ rawData: Uint8Array }} props
 */
const PdfViewer = ({ rawData, fileName }) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [renderingPages, setRenderingPages] = useState(new Set());
  const containerRef = useRef(null);
  const canvasRefs = useRef({});
  const renderTasks = useRef({});

  // Load the PDF document
  useEffect(() => {
    if (!rawData) return;
    let cancelled = false;

    const loadPdf = async () => {
      setLoading(true);
      try {
        const doc = await pdfjsLib.getDocument({ data: rawData.slice() }).promise;
        if (!cancelled) {
          setPdf(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();
    return () => { cancelled = true; };
  }, [rawData]);

  // Render a single page to its canvas
  const renderPage = useCallback(async (pageNum) => {
    if (!pdf || !canvasRefs.current[pageNum]) return;
    if (renderTasks.current[pageNum]) {
      renderTasks.current[pageNum].cancel();
    }

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRefs.current[pageNum];
      const ctx = canvas.getContext('2d');

      // Use devicePixelRatio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      ctx.scale(dpr, dpr);

      const task = page.render({ canvasContext: ctx, viewport });
      renderTasks.current[pageNum] = task;
      await task.promise;
    } catch (err) {
      if (err.name !== 'RenderingCancelled') {
        console.error(`Error rendering page ${pageNum}:`, err);
      }
    }
  }, [pdf, scale, rotation]);

  // Re-render all visible pages when scale/rotation/pdf changes
  useEffect(() => {
    if (!pdf) return;
    // Render all pages (for scroll view)
    for (let i = 1; i <= numPages; i++) {
      renderPage(i);
    }
  }, [pdf, scale, rotation, renderPage, numPages]);

  const zoomIn = () => setScale(s => Math.min(3, s + 0.2));
  const zoomOut = () => setScale(s => Math.max(0.4, s - 0.2));
  const rotate = () => setRotation(r => (r + 90) % 360);
  const toggleDarkMode = () => setDarkMode(d => !d);

  const handlePrint = () => {
    if (!rawData) return;
    const blob = new Blob([rawData], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  };

  const handleShare = async () => {
    if (!rawData || !navigator.share) return;
    try {
      const blob = new Blob([rawData], { type: 'application/pdf' });
      const f = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });
      await navigator.share({ files: [f], title: fileName || 'PDF Document' });
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  const scrollToPage = (pageNum) => {
    setCurrentPage(pageNum);
    const canvas = canvasRefs.current[pageNum];
    if (canvas) {
      canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Track which page is currently in view
  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = parseInt(entry.target.dataset.page, 10);
            if (pageNum) setCurrentPage(pageNum);
          }
        }
      },
      { root: containerRef.current, threshold: 0.5 }
    );

    for (let i = 1; i <= numPages; i++) {
      const el = canvasRefs.current[i]?.parentElement;
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [numPages, pdf]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>Failed to load PDF</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3">
        <div className="flex items-center gap-1.5">
          <button onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums min-w-[80px] text-center">
            {currentPage} / {numPages}
          </span>
          <button onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={zoomOut} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Zoom out">
            <ZoomOut size={18} />
          </button>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Zoom in">
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button onClick={rotate} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Rotate">
            <RotateCw size={18} />
          </button>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button onClick={toggleDarkMode} className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${darkMode ? 'text-yellow-400' : 'text-gray-600 dark:text-gray-300'}`} title="Dark reading mode">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Print">
            <Printer size={18} />
          </button>
          {navigator.share && (
            <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Share">
              <Share2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Pages container */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-auto rounded-xl p-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-200 dark:bg-gray-900'}`}
        style={{ maxHeight: 'calc(100vh - 16rem)' }}
      >
        <div className="flex flex-col items-center gap-4">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div
              key={pageNum}
              data-page={pageNum}
              className={`shadow-xl rounded-sm ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
            >
              <canvas
                ref={el => { canvasRefs.current[pageNum] = el; }}
                className="block"
                style={darkMode ? { filter: 'invert(0.88) hue-rotate(180deg)' } : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;
