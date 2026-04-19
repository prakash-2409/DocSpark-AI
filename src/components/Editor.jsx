import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import {
  Bold, Italic, Strikethrough, Code, Type, Hash, Clock,
  FileText, Pilcrow, Minus, Link2, Heading1, Heading2
} from 'lucide-react';
import SaveIndicator from './SaveIndicator';

/* ── Floating Bubble Toolbar ─────────────────────────────── */
const BubbleToolbar = ({ editor }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) { setShow(false); return; }
    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const editorRect = view.dom.closest('.editor-paper')?.getBoundingClientRect();
    if (!editorRect) return;
    setPosition({
      top: start.top - editorRect.top - 52,
      left: Math.max(60, Math.min(
        (start.left + end.left) / 2 - editorRect.left,
        editorRect.width - 60
      )),
    });
    setShow(true);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', updatePosition);
    editor.on('blur', () => setShow(false));
    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('blur', () => setShow(false));
    };
  }, [editor, updatePosition]);

  if (!show || !editor) return null;

  const items = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Bold (⌘B)' },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Italic (⌘I)' },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: 'Strikethrough' },
    { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), label: 'Inline Code' },
    { type: 'divider' },
    { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), label: 'Heading 1' },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), label: 'Heading 2' },
  ];

  return (
    <div
      ref={toolbarRef}
      className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
      style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center gap-0.5 bg-gray-900 dark:bg-gray-800 rounded-xl px-1.5 py-1 shadow-2xl shadow-black/25 border border-gray-700/50">
        {items.map((item, i) => {
          if (item.type === 'divider') {
            return <div key={i} className="w-px h-4 bg-gray-700 mx-0.5" />;
          }
          const { icon: Icon, action, active, label } = item;
          return (
            <button
              key={label}
              onMouseDown={(e) => { e.preventDefault(); action(); }}
              className={`p-1.5 rounded-lg transition-all duration-150 ${
                active
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/70'
              }`}
              title={label}
            >
              <Icon size={13} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>
      {/* Arrow */}
      <div className="flex justify-center">
        <div className="w-2.5 h-2.5 bg-gray-900 dark:bg-gray-800 rotate-45 -mt-1.5 border-r border-b border-gray-700/50" />
      </div>
    </div>
  );
};

/* ── Inline Stats Pill ───────────────────────────────────── */
const EditorStats = ({ editor }) => {
  const stats = useMemo(() => {
    if (!editor) return { words: 0, chars: 0, readTime: '0m' };
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const mins = Math.max(1, Math.ceil(words / 200));
    const readTime = words === 0 ? '—' : `${mins}m`;
    return { words, chars, readTime };
  }, [editor?.state?.doc?.content]);

  return (
    <div className="flex items-center gap-4 px-5 py-2.5 text-xs text-gray-400 dark:text-gray-500 select-none">
      <span className="flex items-center gap-1.5">
        <Type size={11} />
        <span className="font-semibold text-gray-600 dark:text-gray-400 tabular-nums">{stats.words.toLocaleString()}</span>
        <span>words</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Hash size={11} />
        <span className="font-semibold text-gray-600 dark:text-gray-400 tabular-nums">{stats.chars.toLocaleString()}</span>
        <span>chars</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Clock size={11} />
        <span className="font-semibold text-gray-600 dark:text-gray-400 tabular-nums">{stats.readTime}</span> read
      </span>
    </div>
  );
};

/* ── Scroll Progress Indicator ───────────────────────────── */
const ScrollProgress = ({ containerRef }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  if (progress === 0) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 z-10">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-150 ease-out rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/* ── Line Numbers Gutter ─────────────────────────────────── */
const LineNumbers = ({ editor }) => {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const el = editor.view.dom;
      if (!el) return;
      const blocks = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, hr');
      setLineCount(Math.max(blocks.length, 1));
    };
    update();
    editor.on('update', update);
    return () => editor.off('update', update);
  }, [editor]);

  return (
    <div className="hidden lg:flex flex-col items-end pt-10 pr-0 pl-3 text-[11px] leading-[1.75rem] text-gray-300 dark:text-gray-700 select-none font-mono min-w-[2.5rem] tracking-tight">
      {Array.from({ length: lineCount }, (_, i) => (
        <span key={i} className="h-7 flex items-center">{i + 1}</span>
      ))}
    </div>
  );
};

/* ── Main Editor Component ───────────────────────────────── */
const Editor = ({ content, onChange, setEditorInstance, saveStatus, lastSaved, isDarkMode }) => {
  const scrollRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Enable all builtin block types
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: {},
        blockquote: {},
        horizontalRule: {},
        bulletList: {},
        orderedList: {},
      }),
      Placeholder.configure({
        placeholder: 'Start writing something amazing...',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Typography,  // Smart quotes, em-dashes, ellipsis, etc.
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      if (setEditorInstance) setEditorInstance(editor);
    },
    editorProps: {
      attributes: {
        class: [
          'prose prose-lg max-w-none focus:outline-none',
          'min-h-[70vh] px-8 sm:px-14 py-10',
          'outline-none leading-relaxed',
          isDarkMode ? 'prose-invert text-gray-200' : 'text-gray-800',
        ].join(' '),
        spellcheck: 'true',
      },
    },
  });

  // ── Keyboard shortcut: Ctrl+S → force save ──────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Autosave handles this, but show a visual hint
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="editor-wrapper mt-6 flex flex-col">
      {/* Paper container */}
      <div
        className={`editor-paper relative rounded-2xl overflow-hidden transition-all duration-500 ${
          isDarkMode ? 'bg-gray-900' : 'bg-white'
        } ${
          isFocused
            ? 'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] ring-2 ring-blue-500/20 dark:ring-blue-400/20'
            : 'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ring-1 ring-gray-200 dark:ring-gray-700/60'
        }`}
      >
        {/* Scroll progress */}
        <ScrollProgress containerRef={scrollRef} />

        {/* macOS-style title bar */}
        <div className={`relative flex items-center justify-between px-5 py-3 border-b ${
          isDarkMode
            ? 'border-gray-800/80 bg-gray-900/80'
            : 'border-gray-100 bg-gray-50/80'
        } backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            {/* Traffic lights */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-default shadow-sm shadow-red-400/40" />
              <span className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-default shadow-sm shadow-amber-400/40" />
              <span className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-default shadow-sm shadow-green-400/40" />
            </div>

            {/* Label */}
            <div className={`ml-3 flex items-center gap-1.5 text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <FileText size={12} />
              <span className="font-medium">Editor</span>
              {isFocused && (
                <span className="ml-1.5 flex items-center gap-1 text-blue-500 dark:text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Editing</span>
                </span>
              )}
            </div>
          </div>

          {/* Inline stats */}
          <EditorStats editor={editor} />
        </div>

        {/* Editor body */}
        <div
          ref={scrollRef}
          className="flex max-h-[75vh] overflow-y-auto overflow-x-hidden scrollbar-thin"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <LineNumbers editor={editor} />
          <div className="flex-1 min-w-0">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Bottom status bar */}
        <div className={`flex items-center justify-between px-5 py-2 border-t text-[11px] ${
          isDarkMode
            ? 'border-gray-800/80 bg-gray-900/50 text-gray-600'
            : 'border-gray-100 bg-gray-50/50 text-gray-400'
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Pilcrow size={10} />
              UTF-8
            </span>
            <span className="flex items-center gap-1">
              <Minus size={10} className="inline" />
              Markdown
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Autosave indicator */}
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />

            <div className={`w-px h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* Focus status */}
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                isFocused ? 'bg-green-400' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`} />
              <span>{isFocused ? 'Active' : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* Bubble toolbar overlay */}
        <BubbleToolbar editor={editor} />
      </div>
    </div>
  );
};

export default Editor;
