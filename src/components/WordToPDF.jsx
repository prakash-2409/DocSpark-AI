import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, File, ChevronDown } from 'lucide-react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import { trackAndStamp } from '../lib/exportLimit';

const WordToPDF = ({ isDarkMode }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        setError(null);
        setSuccess(false);

        if (!selectedFile) return;

        const fileType = selectedFile.name.split('.').pop().toLowerCase();
        if (fileType !== 'doc' && fileType !== 'docx') {
            setError('Please select a valid Word document (.doc or .docx)');
            return;
        }

        setFile(selectedFile);
    };

    const convertToPDF = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const textContent = tempDiv.innerText || tempDiv.textContent;

            const doc = new jsPDF();
            const lines = doc.splitTextToSize(textContent, 180);
            doc.text(lines, 10, 10);

            trackAndStamp(doc);
            doc.save(`${file.name.replace(/\.[^/.]+$/, "")}.pdf`);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError('Failed to convert document. Please try again.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className={`text-4xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Word to PDF Converter</h2>
            </div>

            {/* Drop Zone */}
            <div
                className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#376fea]' : 'bg-[#3b82f6]'} min-h-[320px] flex flex-col items-center justify-center p-8`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Dashed Border Overlay */}
                <div className={`absolute inset-4 border-2 border-dashed border-white/30 rounded-lg pointer-events-none ${isDragging ? 'border-white/60 bg-white/10' : ''}`}></div>

                <div className="z-10 flex flex-col items-center gap-6">
                    {!file ? (
                        <>
                            <div className="opacity-90">
                                <FileText size={64} className="text-white" />
                            </div>

                            <div className="flex bg-white rounded-md shadow-lg overflow-hidden group hover:scale-105 transition-transform duration-200 cursor-pointer relative">
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept=".doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="px-6 py-4 flex items-center gap-3 font-bold text-[#3b82f6] uppercase tracking-wide text-sm">
                                    <File size={20} />
                                    <span>Choose Files</span>
                                </div>
                                <div className="bg-gray-50 border-l border-gray-100 px-3 py-4 flex items-center justify-center">
                                    <ChevronDown size={20} className="text-gray-400" />
                                </div>
                            </div>

                            <p className="text-white/80 font-medium">or drop files here</p>
                        </>
                    ) : (
                        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                    <FileText size={32} className="text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{file.name}</h4>
                                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm flex items-center gap-1 bg-red-50 px-3 py-2 rounded-lg">
                                        <AlertCircle size={14} /> {error}
                                    </div>
                                )}

                                {success ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <div className="text-green-600 font-medium flex items-center justify-center gap-2 bg-green-50 py-3 rounded-lg">
                                            <Check size={18} /> Download Started!
                                        </div>
                                        <button
                                            onClick={() => { setFile(null); setSuccess(false); }}
                                            className="text-gray-500 hover:text-gray-900 text-sm font-medium underline underline-offset-4"
                                        >
                                            Convert another file
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={convertToPDF}
                                        disabled={isConverting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isConverting ? <Loader2 className="animate-spin" /> : 'Convert to PDF'}
                                    </button>
                                )}

                                {!success && (
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-gray-400 hover:text-gray-600 text-sm"
                                    >
                                        Remove file
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Features/Trust Section */}
            <div className="mt-12 grid md:grid-cols-2 gap-8">
                <div className={`text-left space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p className="leading-relaxed">
                        Effortlessly convert Word documents to PDF files for free, without watermarks or the need to sign up. Just upload and convert instantly.
                    </p>
                </div>
                <div className="space-y-3">
                    {[
                        "Trusted by thousands of users",
                        "Easy-to-use online Word to PDF converter",
                        "Compatible with Mac, Windows, iOS, and Android"
                    ].map((text, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                                <Check size={12} className="text-white stroke-[3px]" />
                            </div>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WordToPDF;
