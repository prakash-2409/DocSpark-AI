import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Editor from '../components/Editor';
import { FileType, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { trackAndStamp } from '../lib/exportLimit';

const TextToPdfPage = () => {
    const [content, setContent] = useState('<p>Start writing...</p>');
    const [editorInstance, setEditorInstance] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (!editorInstance) return;
        setIsExporting(true);

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // We need to target the ProseMirror content div
            // Since we don't have a direct ref to the inner div from here easily without modifying Editor, 
            // we will select by class which is generally safe in this app structure.
            const editorContent = document.querySelector('.ProseMirror');

            if (editorContent) {
                await doc.html(editorContent, {
                    callback: function (doc) {
                        trackAndStamp(doc);
                        doc.save('document.pdf');
                    },
                    x: 10,
                    y: 10,
                    width: 190, // A4 width (210) - margins (20)
                    windowWidth: 800 // Virtual window width for rendering CSS
                });
            }
        } catch (error) {
            console.error("PDF Export failed:", error);
            alert("Failed to create PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportDOCX = () => {
        if (!editorInstance) return;
        const text = editorInstance.getText();
        const doc = new Document({
            sections: [{
                properties: {},
                children: text.split('\n').map(line => new Paragraph({
                    children: [
                        new TextRun(line),
                    ],
                })),
            }],
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "document.docx");
        });
    };

    const handleExportTXT = () => {
        if (!editorInstance) return;
        const text = editorInstance.getText();
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "document.txt");
    };

    return (
        <div className="flex flex-col gap-8">
            <Helmet>
                <title>Text to PDF Converter – Free Online Tool | DocSpark AI</title>
                <meta name="description" content="Convert text to PDF online for free. Fast, secure text to PDF converter with instant download." />
            </Helmet>

            {/* Editor Section with Actions */}
            <section className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Text to PDF Converter
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isExporting ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> : <FileType size={18} />}
                            <span>{isExporting ? ' converting...' : 'PDF'}</span>
                        </button>
                        <button onClick={handleExportDOCX} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">
                            <FileText size={18} />
                            <span>Word</span>
                        </button>
                    </div>
                </div>

                <Editor
                    content={content}
                    onChange={setContent}
                    setEditorInstance={setEditorInstance}
                />
            </section>

            {/* SEO Content Section */}
            <section className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-gray-900/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h2>What is this tool?</h2>
                <p>
                    The <strong>Text to PDF Converter</strong> by DocSpark AI is a simple, powerful, and secure online tool designed to help you transform your plain text into professional PDF documents instantly.
                    Whether you are a student drafting an assignment, a professional writing a report, or just someone who needs to save a quick note as a reliable document, our tool is here to help.
                </p>

                <h3>How to use the Text to PDF Converter</h3>
                <p>Using our tool is incredibly straightforward. Follow these simple steps:</p>
                <ol>
                    <li><strong>Type or Paste:</strong> Enter your text directly into the editor above, or copy and paste it from another source like a website or a Word document.</li>
                    <li><strong>Edit and Format:</strong> Use the built-in formatting tools to bold, italicize, or style your text exactly how you want it to appear in the final PDF.</li>
                    <li><strong>Convert:</strong> Once you are happy with your document, click the red <strong>PDF</strong> button in the top right corner.</li>
                    <li><strong>Download:</strong> Your PDF file will be generated and downloaded to your device instantly. You can also choose to save it as a Word (DOCX) or Text (TXT) file.</li>
                </ol>

                <h3>Safe, Private, and Secure</h3>
                <p>
                    We prioritize your privacy. Unlike many other online tools, our Text to PDF Converter processes your data entirely within your browser.
                    <strong>We do not store your files on our servers.</strong> This means your documents remain 100% private and secure, and no one else has access to them.
                    Once you close the tab, your data is gone from our system.
                </p>

                <h3>Frequently Asked Questions (FAQ)</h3>

                <h4>Is this converter really free?</h4>
                <p>Yes, the basic Text to PDF conversion is completely free to use. You can generate unlimited PDF files without paying a cent.</p>

                <h4>Can I convert Word documents to PDF here?</h4>
                <p>This page is specifically for converting plain text to PDF. If you have an existing Word document (.docx) that you want to convert, please check out our <a href="/word-to-pdf">Word to PDF Converter</a>.</p>

                <h4>Do I need to install any software?</h4>
                <p>No! DocSpark AI runs entirely in your web browser. You don't need to download or install anything to use our tools. It works on Windows, Mac, Linux, and even mobile devices.</p>

                <h4>Can I edit the PDF after downloading?</h4>
                <p>Once downloaded, the PDF is a standard document. You would need a dedicated PDF editor to make further changes, which is why we recommend finalizing your text in our editor before converting.</p>
            </section>
        </div>
    );
};

export default TextToPdfPage;
