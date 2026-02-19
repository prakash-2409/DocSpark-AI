import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, FileText, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { trackAndStamp } from '../lib/exportLimit';
import { saveAs } from 'file-saver';
import { parseFile } from '../lib/fileParser';
import { saveFile } from '../lib/storage';

const WordToPdfPage = ({ onNavigate }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = async (file) => {
        if (!file.name.endsWith('.docx')) {
            setError('Please upload a valid .docx file.');
            return;
        }

        setError(null);
        setSuccess(false);
        setIsConverting(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            // Convert to HTML instead of raw text to preserve formatting
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            const htmlContent = result.value;

            // Create a temporary container to render HTML for jsPDF
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            // Apply basic prose styles to mimic document
            container.className = 'prose prose-lg max-w-none';
            container.style.width = '190mm'; // Match PDF width
            container.style.padding = '10mm';
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            document.body.appendChild(container);

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            await doc.html(container, {
                callback: function (doc) {
                    const pdfName = file.name.replace('.docx', '.pdf');
                    trackAndStamp(doc);
                    doc.save(pdfName);
                    document.body.removeChild(container);
                    setSuccess(true);
                    setIsConverting(false);
                },
                x: 10,
                y: 10,
                width: 190,
                windowWidth: 800
            });

        } catch (err) {
            console.error(err);
            setError('Failed to convert file. Please ensure it is a valid DOCX.');
            setIsConverting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Helmet>
                <title>Word to PDF Converter – Free DOCX to PDF Online | DocHub</title>
                <meta name="description" content="Convert Word documents to PDF online for free. Fast, secure DOCX to PDF converter. No registration needed. Files stay on your device." />
            </Helmet>

            <div className="flex flex-col gap-6">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Word to PDF Converter
                </h1>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white dark:bg-gray-900/50
            ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".docx"
                        onChange={handleFileSelect}
                    />

                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                        {isConverting ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                        {isConverting ? 'Converting...' : 'Upload DOCX file'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                        Drag and drop your Word document here, or click to browse. We support .docx files.
                    </p>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                            <Check size={18} />
                            <span>Conversion successful! Download started.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Or open in editor */}
            {onNavigate && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Want to edit it first? Open the Word file in our universal editor.
                    </p>
                    <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                        <FileText size={18} />
                        Open in Editor
                        <ArrowRight size={14} />
                        <input
                            type="file"
                            className="hidden"
                            accept=".doc,.docx"
                            onChange={async (e) => {
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
                            }}
                        />
                    </label>
                </div>
            )}

            {/* SEO Content Section */}
            <section className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h2>Convert Word to PDF formatted files</h2>
                <p>
                    The <strong>Word to PDF Converter</strong> is your go-to solution for transforming Microsoft Word documents (.docx) into universally compatible PDF files.
                    Maintaining the integrity of your document helps ensure that your recipient sees exactly what you intended, regardless of the device they use.
                </p>

                <h3>Why use our DOCX to PDF Converter?</h3>
                <ul>
                    <li><strong>Accuracy:</strong> We extract the text from your Word document and generate a clean, legible PDF.</li>
                    <li><strong>Speed:</strong> conversions happen instantly in your browser. No waiting for server uploads.</li>
                    <li><strong>Privacy:</strong> Your files never leave your computer. We do not upload or store your documents.</li>
                </ul>

                <h3>How to Convert Text to PDF from Word</h3>
                <ol>
                    <li><strong>Select File:</strong> Click the upload box above or drag and drop your .docx file.</li>
                    <li><strong>Processing:</strong> Our tool instantly reads formatting and text structure.</li>
                    <li><strong>Download:</strong> The converted PDF file will automatically download to your device.</li>
                </ol>

                <p>
                    This tool is specifically optimized for text-heavy documents like essays, reports, legal drafts, and manuscripts.
                </p>

                <h3>FAQ: Word to PDF</h3>

                <h4>Is it safe to convert sensitive documents?</h4>
                <p>Absolutely. Since the conversion happens locally in your browser using JavaScript, your sensitive data is never transmitted over the internet to our servers.</p>

                <h4>Can I convert old .doc files?</h4>
                <p>Currently, we support the modern <strong>.docx</strong> format. If you have an old .doc file, we recommend opening it in Word and saving it as .docx first.</p>

                <h4>Does it preserve images?</h4>
                <p>Our current "Standard" conversion focuses on text extraction to ensure a lightweight and clean PDF. Complex images and layouts might be simplified.</p>
            </section>
        </div>
    );
};

export default WordToPdfPage;
