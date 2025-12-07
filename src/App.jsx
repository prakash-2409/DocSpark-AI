import React, { useState } from 'react';
import Editor from './components/Editor';
import AIToolbar from './components/AIToolbar';
import PricingModal from './components/PricingModal';
import { Download, FileText, FileType, Moon, Sun, Settings, Check, Code, Crown, User } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [content, setContent] = useState('<p>Start writing...</p>');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // User plan management
  const [userPlan, setUserPlan] = useState('free'); // 'free', 'pro', 'enterprise'
  const [showPricingModal, setShowPricingModal] = useState(false);

  const isPaidUser = userPlan === 'pro' || userPlan === 'enterprise';

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd apply class to body/html
  };

  const handleExportPDF = () => {
    if (!editorInstance) return;

    // Simple PDF export using jsPDF
    const doc = new jsPDF();
    const text = editorInstance.getText();
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save('document.pdf');
    setShowExportMenu(false);
  };

  const handleExportTXT = () => {
    if (!editorInstance) return;
    const text = editorInstance.getText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "document.txt");
    setShowExportMenu(false);
  };

  const handleExportHTML = () => {
    if (!editorInstance) return;
    const html = editorInstance.getHTML();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    saveAs(blob, "document.html");
    setShowExportMenu(false);
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
    // setShowExportMenu(false); // Removed
  };

  const handleSelectPlan = (planId) => {
    setUserPlan(planId);
    // In production, integrate with payment gateway (Stripe, PayPal, etc.)
    if (planId === 'pro') {
      alert('🎉 Welcome to Pro! You now have access to all AI features.');
    } else if (planId === 'enterprise') {
      alert('📧 Our sales team will contact you shortly!');
    }
  };

  const handleUpgradeClick = () => {
    setShowPricingModal(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ConvertFlow AI</h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type, format, and convert your text instantly with AI.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* User Plan Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isPaidUser
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent'
              : 'bg-white border-gray-200 text-gray-700'
              }`}>
              {isPaidUser ? <Crown size={16} className="text-yellow-300" /> : <User size={16} />}
              <span className="text-sm font-medium capitalize">{userPlan}</span>
            </div>

            {!isPaidUser && (
              <button
                onClick={handleUpgradeClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40 active:scale-95"
              >
                <Crown size={16} />
                <span>Upgrade</span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-600 shadow-sm border border-gray-200'}`}
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'}`}></div>

            {/* AI Toolbar */}
            <AIToolbar
              editor={editorInstance}
              isPaidUser={isPaidUser}
              onUpgradeClick={handleUpgradeClick}
            />

            <div className={`h-8 w-px mx-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'}`}></div>

            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95">
              <FileType size={18} />
              <span>PDF</span>
            </button>
            <button onClick={handleExportDOCX} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95">
              <FileText size={18} />
              <span>Word</span>
            </button>
            <button onClick={handleExportTXT} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <FileText size={18} className="text-gray-500" />
              <span>TXT</span>
            </button>
          </div>
        </header>

        {/* Editor Section */}
        <main className="flex-1 flex flex-col">
          <Editor
            content={content}
            onChange={setContent}
            setEditorInstance={setEditorInstance}
          />
          <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Pro tip: Select text to see formatting options like Bold, Italic, and Strike-through.
          </div>
        </main>

      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}

export default App;
