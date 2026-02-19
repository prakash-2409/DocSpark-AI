import React, { useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Undo, Redo, Minus, Code,
  Sparkles, Wand2
} from 'lucide-react';
import {
  applyAssignmentLayout, removeExtraSpaces,
  fixBrokenLines, normalizeFonts, quickClean
} from '../lib/formatHelper';
import VoiceInput from './VoiceInput';
import ReadAloud from './ReadAloud';

/**
 * FormatToolbar — rich formatting bar that sits above the editor.
 * Includes standard formatting + "Fix" tools for students.
 */
const FormatToolbar = ({ editor, onAIClick }) => {
  const [showFixMenu, setShowFixMenu] = useState(false);

  if (!editor) return null;

  const btnClass = (isActive) =>
    `p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;

  const Divider = () => <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl shadow-sm">
      {/* Undo / Redo */}
      <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)} title="Undo">
        <Undo size={16} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)} title="Redo">
        <Redo size={16} />
      </button>

      <Divider />

      {/* Basic Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive('underline'))}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={btnClass(editor.isActive('highlight'))}
        title="Highlight"
      >
        <Highlighter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btnClass(editor.isActive('code'))}
        title="Inline Code"
      >
        <Code size={16} />
      </button>

      <Divider />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btnClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btnClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <Divider />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btnClass(false)}
        title="Horizontal Rule"
      >
        <Minus size={16} />
      </button>

      <Divider />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btnClass(editor.isActive({ textAlign: 'left' }))}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btnClass(editor.isActive({ textAlign: 'center' }))}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btnClass(editor.isActive({ textAlign: 'right' }))}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>

      <Divider />

      {/* Voice & Read Aloud */}
      <VoiceInput editor={editor} />
      <ReadAloud editor={editor} />

      <Divider />

      {/* Fix / Clean Tools */}
      <div className="relative">
        <button
          onClick={() => setShowFixMenu(!showFixMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          title="Quick fix tools"
        >
          <Wand2 size={15} />
          <span className="hidden sm:inline">Fix</span>
        </button>

        {showFixMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowFixMenu(false)} />
            <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-[200px]">
              <button
                onClick={() => { quickClean(editor); setShowFixMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">Quick Clean</span>
                <span className="block text-xs text-gray-400 mt-0.5">Fix spaces, lines & fonts</span>
              </button>
              <button
                onClick={() => { applyAssignmentLayout(editor); setShowFixMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">Assignment Format</span>
                <span className="block text-xs text-gray-400 mt-0.5">Clean layout with proper headings</span>
              </button>
              <button
                onClick={() => { removeExtraSpaces(editor); setShowFixMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">Remove Extra Spaces</span>
                <span className="block text-xs text-gray-400 mt-0.5">Collapse double/triple spaces</span>
              </button>
              <button
                onClick={() => { fixBrokenLines(editor); setShowFixMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">Fix Broken Lines</span>
                <span className="block text-xs text-gray-400 mt-0.5">Merge accidentally split lines</span>
              </button>
              <button
                onClick={() => { normalizeFonts(editor); setShowFixMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">Normalise Fonts</span>
                <span className="block text-xs text-gray-400 mt-0.5">Strip inline styles</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* AI button (optional) */}
      {onAIClick && (
        <button
          onClick={onAIClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-md transition-all ml-auto"
          title="AI Tools"
        >
          <Sparkles size={15} />
          <span className="hidden sm:inline">AI</span>
        </button>
      )}
    </div>
  );
};

export default FormatToolbar;
