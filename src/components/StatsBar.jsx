import React, { useMemo } from 'react';
import {
  FileText, Clock, Mic as MicIcon, BookOpen,
  Type, AlignJustify, Hash
} from 'lucide-react';

/**
 * StatsBar — live document statistics that update on every keystroke.
 * Shows word count, character count, sentences, paragraphs,
 * reading time, speaking time, and estimated page count.
 */
const StatsBar = ({ editor }) => {
  const stats = useMemo(() => {
    if (!editor) {
      return { words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, readTime: '0 min', speakTime: '0 min', pages: 0 };
    }

    const text = editor.getText();
    const html = editor.getHTML();

    // Word count – split on whitespace, filter empty
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Character counts
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;

    // Sentence count – split on sentence-ending punctuation
    const sentences = text.trim()
      ? (text.match(/[.!?]+(\s|$)/g) || []).length || (words > 0 ? 1 : 0)
      : 0;

    // Paragraph count – count <p>, <h1>-<h6> tags with content
    const pTags = (html.match(/<(p|h[1-6])[^>]*>[^<]+/g) || []).length;
    const paragraphs = Math.max(pTags, words > 0 ? 1 : 0);

    // Reading time (avg 200 wpm)
    const readMinutes = Math.ceil(words / 200);
    const readTime = readMinutes < 1 && words > 0
      ? '< 1 min'
      : `${readMinutes} min`;

    // Speaking time (avg 130 wpm)
    const speakMinutes = Math.ceil(words / 130);
    const speakTime = speakMinutes < 1 && words > 0
      ? '< 1 min'
      : `${speakMinutes} min`;

    // Estimated pages (250 words per page)
    const pages = Math.max(Math.ceil(words / 250), words > 0 ? 1 : 0);

    return { words, chars, charsNoSpace, sentences, paragraphs, readTime, speakTime, pages };
  }, [editor?.state.doc.content]);

  const statItems = [
    { icon: Type, label: 'Words', value: stats.words.toLocaleString() },
    { icon: Hash, label: 'Characters', value: stats.chars.toLocaleString() },
    { icon: AlignJustify, label: 'Sentences', value: stats.sentences },
    { icon: FileText, label: 'Paragraphs', value: stats.paragraphs },
    { icon: BookOpen, label: 'Read time', value: stats.readTime },
    { icon: MicIcon, label: 'Speak time', value: stats.speakTime },
    { icon: FileText, label: 'Pages', value: `~${stats.pages}` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/50 rounded-xl text-xs text-gray-500 dark:text-gray-400">
      {statItems.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-1.5" title={label}>
          <Icon size={12} className="text-gray-400 dark:text-gray-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
          <span className="hidden sm:inline">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
