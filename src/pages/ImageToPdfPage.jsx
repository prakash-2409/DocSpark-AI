import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Trash2, Download, Plus, AlertCircle, Check,
  Image as ImageIcon, X, MoveUp, MoveDown, Settings,
  FileText, RotateCw, Maximize2, Minimize2, Sun, Contrast,
  Crop, FlipHorizontal, FlipVertical, SlidersHorizontal, Share2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { trackAndStamp } from '../lib/exportLimit';

/**
 * ImageToPdfPage — convert one or more images to a PDF with per-image editing.
 *
 * Supports: PNG, JPG, JPEG, WEBP, BMP, GIF
 * Per-image: rotation, flip, brightness, contrast, scale, fit mode, orientation
 * Global: page size, quality, margins, orientation
 */
const ImageToPdfPage = ({ onNavigate }) => {
  const [images, setImages] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pageSize, setPageSize] = useState('a4');
  const [quality, setQuality] = useState(0.92);
  const [orientation, setOrientation] = useState('auto');   // 'auto' | 'portrait' | 'landscape'
  const [margin, setMargin] = useState(36);                 // in pt (0-72)
  const [editingId, setEditingId] = useState(null);         // open editor for this image
  const fileInputRef = useRef(null);

  const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif'];

  // Add images
  const addImages = useCallback(async (fileList) => {
    setError(null);
    setSuccess(false);
    const newImages = [];

    for (const file of fileList) {
      if (!ACCEPTED.includes(file.type) && !/\.(png|jpe?g|webp|bmp|gif)$/i.test(file.name)) {
        setError('Only image files (PNG, JPG, WEBP, BMP, GIF) are supported.');
        continue;
      }

      const url = URL.createObjectURL(file);
      const dims = await getImageDimensions(url);

      newImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        url,
        width: dims.width,
        height: dims.height,
        size: file.size,
        rotation: 0,
        flipH: false,
        flipV: false,
        brightness: 100,  // 0-200, default 100
        contrast: 100,    // 0-200, default 100
        scale: 100,       // % of available area, 10-200
        fitMode: 'contain', // 'contain' | 'cover' | 'stretch'
        imgOrientation: 'auto', // 'auto' | 'portrait' | 'landscape'
      });
    }

    setImages(prev => [...prev, ...newImages]);
  }, []);

  const getImageDimensions = (url) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 100, height: 100 });
    img.src = url;
  });

  const handleFileChange = (e) => {
    if (e.target.files?.length) addImages(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addImages(Array.from(e.dataTransfer.files));
  };

  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.url) URL.revokeObjectURL(img.url);
      return prev.filter(i => i.id !== id);
    });
  };

  const rotateImage = (id) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
    ));
  };

  const updateImage = (id, updates) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const resetImageEdits = (id) => {
    updateImage(id, {
      rotation: 0, flipH: false, flipV: false,
      brightness: 100, contrast: 100, scale: 100,
      fitMode: 'contain', imgOrientation: 'auto',
    });
  };

  const moveImage = (id, dir) => {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // Convert images to PDF
  const handleConvert = async () => {
    if (images.length === 0) return;
    setConverting(true);
    setError(null);
    setSuccess(false);

    try {
      let doc = null;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgEl = await loadImage(img.url);

        let w = imgEl.naturalWidth;
        let h = imgEl.naturalHeight;

        // Apply rotation swap
        const isRotated = img.rotation === 90 || img.rotation === 270;
        if (isRotated) [w, h] = [h, w];

        // Draw to canvas with rotation, flip, brightness, contrast
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Apply brightness/contrast filter
        ctx.filter = `brightness(${img.brightness}%) contrast(${img.contrast}%)`;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((img.rotation * Math.PI) / 180);
        if (isRotated) {
          ctx.drawImage(imgEl, -h / 2, -w / 2, h, w);
        } else {
          ctx.drawImage(imgEl, -w / 2, -h / 2, w, h);
        }
        ctx.restore();

        const imgData = canvas.toDataURL('image/jpeg', quality);

        // Determine page orientation
        let useOrientation = orientation;
        if (img.imgOrientation !== 'auto') useOrientation = img.imgOrientation;
        if (useOrientation === 'auto') useOrientation = w > h ? 'landscape' : 'portrait';

        // Calculate page dimensions
        let pageW, pageH;
        if (pageSize === 'fit') {
          const scaleFactor = (img.scale / 100);
          pageW = w * 0.75 * scaleFactor;
          pageH = h * 0.75 * scaleFactor;

          if (!doc) {
            doc = new jsPDF({ orientation: pageW > pageH ? 'landscape' : 'portrait', unit: 'pt', format: [pageW, pageH] });
          } else {
            doc.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait');
          }
          doc.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
          continue;
        }

        // A4 or Letter with margins
        const pageDims = pageSize === 'letter'
          ? { w: 612, h: 792 }
          : { w: 595, h: 842 };

        // Apply orientation
        if (useOrientation === 'landscape') {
          pageW = Math.max(pageDims.w, pageDims.h);
          pageH = Math.min(pageDims.w, pageDims.h);
        } else {
          pageW = Math.min(pageDims.w, pageDims.h);
          pageH = Math.max(pageDims.w, pageDims.h);
        }

        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;

        let imgW, imgH, imgX, imgY;
        const scaleFactor = img.scale / 100;

        if (img.fitMode === 'stretch') {
          imgW = maxW * scaleFactor;
          imgH = maxH * scaleFactor;
        } else if (img.fitMode === 'cover') {
          const ratio = Math.max(maxW / (w * 0.75), maxH / (h * 0.75));
          imgW = w * 0.75 * ratio * scaleFactor;
          imgH = h * 0.75 * ratio * scaleFactor;
        } else {
          // contain
          const ratio = Math.min(maxW / (w * 0.75), maxH / (h * 0.75));
          imgW = w * 0.75 * Math.min(ratio, 1) * scaleFactor;
          imgH = h * 0.75 * Math.min(ratio, 1) * scaleFactor;
        }

        imgX = (pageW - imgW) / 2;
        imgY = (pageH - imgH) / 2;

        if (!doc) {
          doc = new jsPDF({ orientation: useOrientation, unit: 'pt', format: [pageW, pageH] });
        } else {
          doc.addPage([pageW, pageH], useOrientation);
        }
        doc.addImage(imgData, 'JPEG', imgX, imgY, imgW, imgH);
      }

      if (doc) {
        trackAndStamp(doc);
        doc.save('images-to-pdf.pdf');
        setSuccess(true);
      }
    } catch (err) {
      console.error('Conversion failed:', err);
      setError('Failed to convert images to PDF.');
    } finally {
      setConverting(false);
    }
  };

  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      <Helmet>
        <title>Image to PDF — DocHub</title>
      </Helmet>

      <div className="flex flex-col gap-6 max-w-3xl mx-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25 mb-4">
            <ImageIcon size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Image to PDF</h1>
          <p className="text-gray-500 dark:text-gray-400">Convert images to a PDF document. Free, local, no uploads.</p>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 bg-white dark:bg-gray-900'}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={36} className={`mx-auto mb-3 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragging ? 'Drop images here' : 'Click or drag images here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, BMP, GIF</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Options */}
        {images.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Page Size:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit to Image</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Orientation:</span>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300"
              >
                <option value="auto">Auto</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Quality:</span>
              <select
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300"
              >
                <option value={0.6}>Low (smaller file)</option>
                <option value={0.8}>Medium</option>
                <option value={0.92}>High</option>
                <option value={1.0}>Maximum</option>
              </select>
            </div>

            {pageSize !== 'fit' && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-medium text-gray-500">Margin:</span>
                <input
                  type="range"
                  min="0"
                  max="72"
                  step="4"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-24 h-1.5 accent-purple-500"
                />
                <span className="text-xs text-gray-400 w-8">{Math.round(margin / 72 * 25.4)}mm</span>
              </div>
            )}
          </div>
        )}

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
              <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-sm">
              <Check size={16} /> PDF downloaded successfully!
              <button onClick={() => setSuccess(false)} className="ml-auto"><X size={14} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image List */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {images.length} image{images.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-sm text-purple-600 hover:underline"
              >
                <Plus size={14} /> Add more
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, index) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-contain transition-all"
                      style={{
                        transform: `rotate(${img.rotation}deg) scaleX(${img.flipH ? -1 : 1}) scaleY(${img.flipV ? -1 : 1})`,
                        filter: `brightness(${img.brightness}%) contrast(${img.contrast}%)`,
                      }}
                    />
                  </div>

                  {/* Order badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Actions (hover) */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => rotateImage(img.id)} className="w-7 h-7 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80" title="Rotate">
                      <RotateCw size={12} />
                    </button>
                    <button onClick={() => updateImage(img.id, { flipH: !img.flipH })} className="w-7 h-7 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80" title="Flip H">
                      <FlipHorizontal size={12} />
                    </button>
                    <button onClick={() => updateImage(img.id, { flipV: !img.flipV })} className="w-7 h-7 bg-black/60 text-white rounded-lg flex items-center justify-center hover:bg-black/80" title="Flip V">
                      <FlipVertical size={12} />
                    </button>
                    <button onClick={() => setEditingId(editingId === img.id ? null : img.id)} className="w-7 h-7 bg-purple-500/80 text-white rounded-lg flex items-center justify-center hover:bg-purple-600" title="Edit">
                      <SlidersHorizontal size={12} />
                    </button>
                    <button onClick={() => removeImage(img.id)} className="w-7 h-7 bg-red-500/80 text-white rounded-lg flex items-center justify-center hover:bg-red-600" title="Remove">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{img.name}</p>
                    <p className="text-[10px] text-gray-400">{img.width}×{img.height} · {formatSize(img.size)}</p>
                  </div>

                  {/* Move controls */}
                  <div className="flex border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => moveImage(img.id, -1)}
                      disabled={index === 0}
                      className="flex-1 py-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center transition-colors"
                    >
                      <MoveUp size={12} />
                    </button>
                    <div className="w-px bg-gray-100 dark:bg-gray-800" />
                    <button
                      onClick={() => moveImage(img.id, 1)}
                      disabled={index === images.length - 1}
                      className="flex-1 py-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center transition-colors"
                    >
                      <MoveDown size={12} />
                    </button>
                  </div>

                  {/* Inline Edit Panel */}
                  {editingId === img.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-3 space-y-2.5"
                    >
                      {/* Brightness */}
                      <div className="flex items-center gap-2">
                        <Sun size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 w-14">Bright</span>
                        <input type="range" min="20" max="200" value={img.brightness}
                          onChange={(e) => updateImage(img.id, { brightness: parseInt(e.target.value) })}
                          className="flex-1 h-1 accent-purple-500" />
                        <span className="text-[10px] text-gray-400 w-8">{img.brightness}%</span>
                      </div>

                      {/* Contrast */}
                      <div className="flex items-center gap-2">
                        <Contrast size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 w-14">Contrast</span>
                        <input type="range" min="20" max="200" value={img.contrast}
                          onChange={(e) => updateImage(img.id, { contrast: parseInt(e.target.value) })}
                          className="flex-1 h-1 accent-purple-500" />
                        <span className="text-[10px] text-gray-400 w-8">{img.contrast}%</span>
                      </div>

                      {/* Scale */}
                      <div className="flex items-center gap-2">
                        <Maximize2 size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 w-14">Scale</span>
                        <input type="range" min="10" max="200" value={img.scale}
                          onChange={(e) => updateImage(img.id, { scale: parseInt(e.target.value) })}
                          className="flex-1 h-1 accent-purple-500" />
                        <span className="text-[10px] text-gray-400 w-8">{img.scale}%</span>
                      </div>

                      {/* Fit Mode */}
                      <div className="flex items-center gap-2">
                        <Crop size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 w-14">Fit</span>
                        <div className="flex gap-1 flex-1">
                          {['contain', 'cover', 'stretch'].map(mode => (
                            <button key={mode} onClick={() => updateImage(img.id, { fitMode: mode })}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all
                                ${img.fitMode === mode
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Per-image orientation */}
                      <div className="flex items-center gap-2">
                        <RotateCw size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="text-[10px] text-gray-500 w-14">Orient</span>
                        <div className="flex gap-1 flex-1">
                          {['auto', 'portrait', 'landscape'].map(o => (
                            <button key={o} onClick={() => updateImage(img.id, { imgOrientation: o })}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all
                                ${img.imgOrientation === o
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                              {o.charAt(0).toUpperCase() + o.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reset */}
                      <button onClick={() => resetImageEdits(img.id)}
                        className="w-full text-[10px] text-gray-400 hover:text-purple-500 transition-colors py-1">
                        Reset all edits
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={converting || images.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {converting ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Converting…
                </>
              ) : (
                <>
                  <Download size={18} />
                  Convert & Download PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* How it works */}
        {images.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {[
              { step: '1', title: 'Add Images', desc: 'Upload PNG, JPG, WEBP, or other images' },
              { step: '2', title: 'Arrange & Rotate', desc: 'Reorder images and rotate if needed' },
              { step: '3', title: 'Get PDF', desc: 'Download your PDF instantly' },
            ].map(item => (
              <div key={item.step} className="text-center p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-lg">
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

export default ImageToPdfPage;
