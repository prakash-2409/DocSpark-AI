import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import FormatToolbar from '../components/FormatToolbar';
import ExportMenu from '../components/ExportMenu';
import AIToolbar from '../components/AIToolbar';
import StatsBar from '../components/StatsBar';
import FocusMode from '../components/FocusMode';
import { getFile, updateFile, touchLastOpened } from '../lib/storage';
import { ArrowLeft, Save, CheckCircle, Loader2, Maximize2 } from 'lucide-react';

/**
 * EditorPage — the universal document editor.
 * 
 * Loads a document from IndexedDB by fileId, or creates a scratch editor.
 * Auto-saves content back to IndexedDB on change (debounced).
 * Shows FormatToolbar + ExportMenu + optional AI toolbar.
 */
const EditorPage = ({ fileId, onNavigate }) => {
  const [docMeta, setDocMeta] = useState(null);      // { id, name, type, ... }
  const [loading, setLoading] = useState(!!fileId);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [showAI, setShowAI] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const saveTimerRef = useRef(null);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing, paste content, or import a file...",
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: '<p></p>',
    onUpdate: ({ editor }) => {
      // Debounced auto-save
      if (docMeta?.id) {
        debouncedSave(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-8 sm:px-12 py-8 outline-none text-gray-900',
      },
    },
  });

  // Load document from IndexedDB
  useEffect(() => {
    if (fileId && editor) {
      loadDocument(fileId);
    }
  }, [fileId, editor]);

  const loadDocument = async (id) => {
    setLoading(true);
    try {
      const doc = await getFile(id);
      if (doc) {
        setDocMeta(doc);
        editor?.commands.setContent(doc.htmlContent || '<p></p>');
        await touchLastOpened(id);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced save
  const debouncedSave = useCallback((htmlContent) => {
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        if (docMeta?.id) {
          await updateFile(docMeta.id, { htmlContent });
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        setSaveStatus('idle');
      }
    }, 1000);
  }, [docMeta?.id]);

  // Manual save
  const handleManualSave = async () => {
    if (!editor || !docMeta?.id) return;
    setSaveStatus('saving');
    try {
      await updateFile(docMeta.id, { htmlContent: editor.getHTML() });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S → save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      // Ctrl+Shift+F → focus mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, docMeta]);

  const fileName = docMeta?.name || 'Untitled';

  return (
    <div className="flex flex-col max-w-4xl mx-auto">
      <Helmet>
        <title>{fileName} — DocHub Editor</title>
      </Helmet>

      {/* Sticky header: Top bar + Toolbar */}
      <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 pb-3 pt-4 space-y-3 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">

      {/* Top Bar: Back + File name + Save status + Export */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onNavigate('quick-access')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex-shrink-0"
            title="Back to Quick Access"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {fileName}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {docMeta?.type && (
                <span className="uppercase font-medium">{docMeta.type}</span>
              )}
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-yellow-500">
                  <Loader2 size={12} className="animate-spin" /> Saving…
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle size={12} /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setFocusMode(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Focus Mode (Ctrl+Shift+F)"
          >
            <Maximize2 size={16} />
            <span className="hidden sm:inline">Focus</span>
          </button>
          {docMeta?.id && (
            <button
              onClick={handleManualSave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
          <ExportMenu editor={editor} fileName={fileName} />
        </div>
      </div>

      {/* Format Toolbar */}
      <FormatToolbar editor={editor} onAIClick={() => setShowAI(!showAI)} />

      {/* AI Toolbar (optional toggle) */}
      {showAI && (
        <div className="flex justify-end">
          <AIToolbar
            editor={editor}
          />
        </div>
      )}

      </div>{/* end sticky header */}

      {/* Editor Canvas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-blue-600/20 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Loading document...</p>
        </div>
      ) : (
        <div className="editor-paper-wrapper mt-4 relative group">
          {/* Subtle paper shadow layers for depth */}
          <div className="absolute -bottom-1 left-3 right-3 h-4 bg-gray-200/40 dark:bg-gray-800/40 rounded-b-2xl blur-sm -z-10" />
          <div className="absolute -bottom-2 left-6 right-6 h-4 bg-gray-200/20 dark:bg-gray-800/20 rounded-b-2xl blur-md -z-20" />

          <div className="editor-paper bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-500 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] ring-1 ring-gray-200/80 dark:ring-gray-700/50 group-hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]">
            {/* Decorative ruler marks at top */}
            <div className="h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="mt-3 mb-4">
        <StatsBar editor={editor} />
      </div>

      {/* Focus Mode Overlay */}
      <FocusMode
        editor={editor}
        isActive={focusMode}
        onExit={() => setFocusMode(false)}
      />
    </div>
  );
};

export default EditorPage;
