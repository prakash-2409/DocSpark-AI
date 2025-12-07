import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';

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
        <div className="w-full bg-white shadow-sm border border-gray-100 rounded-xl min-h-[80vh] mt-6 overflow-hidden">
            <div className="bg-gray-50/50 border-b border-gray-100 px-4 py-2 text-xs text-gray-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/20 block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400/20 block"></span>
                <span className="w-3 h-3 rounded-full bg-green-400/20 block"></span>
                <span className="ml-2">Editor</span>
            </div>
            <EditorContent editor={editor} />
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden flex divide-x divide-gray-100 p-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            Bold
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            Italic
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('strike') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            Strike
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`px-3 py-1.5 hover:bg-gray-50 text-sm font-medium transition-colors ${editor.isActive('code') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                        >
                            Code
                        </button>
                    </div>
                </BubbleMenu>
            )}
        </div>
    );
};

export default Editor;
