import React, { useState, useRef, useEffect } from 'react';

/**
 * DocumentTitle — inline editable document title.
 *
 * Click to edit, Enter/Blur to save. Syncs back to parent via onChange.
 */
const DocumentTitle = ({ value, onChange, isDarkMode }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  // Keep draft in sync when external value changes
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const commit = () => {
    const trimmed = draft.trim() || 'Untitled Document';
    onChange(trimmed);
    setDraft(trimmed);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') {
      setDraft(value);
      setEditing(false);
    }
  };

  return (
    <div className="flex flex-col">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className={`text-2xl font-bold tracking-tight bg-transparent border-b-2 border-blue-500 outline-none w-full max-w-xs ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
          maxLength={80}
        />
      ) : (
        <h1
          onClick={startEdit}
          title="Click to rename"
          className={`text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity truncate max-w-xs`}
        >
          {value}
        </h1>
      )}
      <p className={`mt-0.5 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {editing ? 'Press Enter to save · Esc to cancel' : 'Click title to rename'}
      </p>
    </div>
  );
};

export default DocumentTitle;
