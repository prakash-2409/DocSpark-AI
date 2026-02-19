import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import {
  Bold, Italic, Strikethrough, Code, Type, Hash, Clock,
  FileText, Pilcrow, Minus
} from 'lucide-react';

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
            left: (start.left + end.left) / 2 - editorRect.left,
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
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), label: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), label: 'Italic' },
        { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), label: 'Strike' },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), label: 'Code' },
    ];

    return (
        <div
            ref={toolbarRef}
            className="absolute z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
        >
            <div className="flex items-center gap-0.5 bg-gray-900 dark:bg-gray-800 rounded-xl px-1.5 py-1 shadow-2xl shadow-black/20 border border-gray-700/50">
                {items.map(({ icon: Icon, action, active, label }) => (
                    <button
                        key={label}
                        onMouseDown={(e) => { e.preventDefault(); action(); }}
                        className={`p-2 rounded-lg transition-all duration-150 ${
                            active
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                        title={label}
                    >
                        <Icon size={14} strokeWidth={2.5} />
                    </button>
                ))}
            </div>
            {/* Arrow pointer */}
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
        const readTime = words === 0 ? '0m' : `${mins}m`;
        return { words, chars, readTime };
    }, [editor?.state?.doc?.content]);

    return (
        <div className="flex items-center gap-4 px-5 py-2.5 text-xs text-gray-400 dark:text-gray-500 select-none">
            <span className="flex items-center gap-1.5">
                <Type size={11} />
                <span className="font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{stats.words}</span> words
            </span>
            <span className="flex items-center gap-1.5">
                <Hash size={11} />
                <span className="font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{stats.chars}</span> chars
            </span>
            <span className="flex items-center gap-1.5">
                <Clock size={11} />
                <span className="font-semibold text-gray-500 dark:text-gray-400 tabular-nums">{stats.readTime}</span> read
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
            // Count visible block nodes
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
const Editor = ({ content, onChange, setEditorInstance }) => {
    const scrollRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start writing something amazing...",
            }),
            Typography,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (setEditorInstance) {
                setEditorInstance(editor);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[70vh] px-8 sm:px-14 py-10 outline-none text-gray-800 dark:text-gray-200 leading-relaxed',
            },
        },
    });

    return (
        <div className="editor-wrapper mt-6 flex flex-col">
            {/* Paper container with subtle depth */}
            <div
                className={`editor-paper relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden transition-all duration-500 ${
                    isFocused
                        ? 'shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] ring-2 ring-blue-500/20 dark:ring-blue-400/20'
                        : 'shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] ring-1 ring-gray-200 dark:ring-gray-700/60'
                }`}
            >
                {/* Scroll progress bar */}
                <ScrollProgress containerRef={scrollRef} />

                {/* Top bar — macOS-style dots + document label */}
                <div className="relative flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-default shadow-sm shadow-red-400/30"></span>
                            <span className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-default shadow-sm shadow-amber-400/30"></span>
                            <span className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-default shadow-sm shadow-green-400/30"></span>
                        </div>
                        <div className="ml-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
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
                    {/* Right side stats in header */}
                    <EditorStats editor={editor} />
                </div>

                {/* Editor body with optional line numbers */}
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
                <div className="flex items-center justify-between px-5 py-2 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] text-gray-400 dark:text-gray-600">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Pilcrow size={10} />
                            UTF-8
                        </span>
                        <span>
                            <Minus size={10} className="inline mr-1" />
                            Markdown
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isFocused ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <span>{isFocused ? 'Active' : 'Idle'}</span>
                    </div>
                </div>

                {/* Bubble toolbar overlay */}
                <BubbleToolbar editor={editor} />
            </div>
        </div>
    );
};

export default Editor;
