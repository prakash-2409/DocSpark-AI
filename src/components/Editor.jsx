import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';

const BubbleToolbar = ({ editor }) => {
    const [show, setShow] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const toolbarRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        if (from === to) {
            setShow(false);
            return;
        }
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const editorRect = view.dom.closest('.w-full')?.getBoundingClientRect();
        if (!editorRect) return;
        const top = start.top - editorRect.top - 50;
        const left = (start.left + end.left) / 2 - editorRect.left;
        setPosition({ top, left });
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

    return (
        <div
            ref={toolbarRef}
            className="absolute z-50 transition-opacity duration-100"
            style={{ top: `${position.top}px`, left: `${position.left}px`, transform: 'translateX(-50%)' }}
        >
            <div className="bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden flex divide-x divide-gray-100 p-1">
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                >
                    Bold
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                >
                    Italic
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('strike') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                >
                    Strike
                </button>
                <button
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}
                    className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('code') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                >
                    Code
                </button>
            </div>
        </div>
    );
};

const Editor = ({ content, onChange, setEditorInstance }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Type '/' for commands, or just start writing...",
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
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-12 py-8 outline-none',
            },
        },
    });

    return (
        <div className="relative w-full bg-white shadow-sm border border-gray-100 rounded-xl min-h-[80vh] mt-6 overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/20 block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400/20 block"></span>
                <span className="w-3 h-3 rounded-full bg-green-400/20 block"></span>
                <span className="ml-2">Editor</span>
            </div>
            <EditorContent editor={editor} />
            <BubbleToolbar editor={editor} />
        </div>
    );
};

export default Editor;
