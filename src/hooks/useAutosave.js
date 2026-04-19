/**
 * useAutosave — Bulletproof localStorage autosave hook.
 *
 * Features:
 *   - Debounced saves (500ms after last keystroke, or every 2s while typing)
 *   - Version history (last 10 snapshots for manual recovery)
 *   - Save status tracking ('idle' | 'saving' | 'saved' | 'error')
 *   - Graceful storage-full handling with quota warnings
 *   - Document title persistence
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'convertflow-autosave';
const HISTORY_KEY = 'convertflow-history';
const TITLE_KEY = 'convertflow-doc-title';
const MAX_HISTORY = 10;
const DEBOUNCE_MS = 500;
const INTERVAL_MS = 2000;

/**
 * Estimate localStorage usage in bytes.
 */
function getStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    total += key.length + (localStorage.getItem(key)?.length || 0);
  }
  return total * 2; // UTF-16 = 2 bytes per char
}

/**
 * @param {string} content — HTML content from the editor
 * @param {object} options
 * @param {boolean} options.enabled — toggle autosave on/off
 * @returns {{ saveStatus, lastSaved, documentTitle, setDocumentTitle, restoreVersion, versionHistory, clearHistory, manualSave }}
 */
export function useAutosave(content, { enabled = true } = {}) {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [documentTitle, setDocumentTitle] = useState(() => {
    try {
      return localStorage.getItem(TITLE_KEY) || 'Untitled Document';
    } catch {
      return 'Untitled Document';
    }
  });
  const [versionHistory, setVersionHistory] = useState([]);

  const debounceTimer = useRef(null);
  const intervalTimer = useRef(null);
  const lastContentRef = useRef(content);
  const isDirty = useRef(false);

  // ── Persist document title ──────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(TITLE_KEY, documentTitle);
    } catch {
      // Silently ignore — title is non-critical
    }
  }, [documentTitle]);

  // ── Core save function ──────────────────────────────────
  const save = useCallback((htmlContent) => {
    if (!enabled) return;

    try {
      setSaveStatus('saving');

      const timestamp = new Date().toISOString();
      const payload = {
        content: htmlContent,
        title: documentTitle,
        savedAt: timestamp,
        version: Date.now(),
      };

      // Save current document
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Push to version history (keep last MAX_HISTORY)
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      } catch {
        history = [];
      }

      // Only push if content actually changed from last version
      const lastVersion = history[0];
      if (!lastVersion || lastVersion.content !== htmlContent) {
        history.unshift({
          content: htmlContent,
          title: documentTitle,
          savedAt: timestamp,
          wordCount: htmlContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length,
        });

        if (history.length > MAX_HISTORY) {
          history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        setVersionHistory(history);
      }

      setLastSaved(new Date(timestamp));
      setSaveStatus('saved');
      isDirty.current = false;

      // Reset to idle after 2s
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('[Autosave] Save failed:', err);
      setSaveStatus('error');

      // If quota exceeded, try to free space by trimming history
      if (err.name === 'QuotaExceededError') {
        try {
          const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
          if (history.length > 2) {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 2)));
            // Retry the save
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
              content: htmlContent,
              title: documentTitle,
              savedAt: new Date().toISOString(),
              version: Date.now(),
            }));
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
          }
        } catch {
          // Last resort — can't save
        }
      }
    }
  }, [enabled, documentTitle]);

  // ── Manual save trigger ─────────────────────────────────
  const manualSave = useCallback(() => {
    save(lastContentRef.current);
  }, [save]);

  // ── Debounced + interval autosave ───────────────────────
  useEffect(() => {
    if (!enabled) return;

    lastContentRef.current = content;
    isDirty.current = true;

    // Clear existing debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce: save 500ms after last change
    debounceTimer.current = setTimeout(() => {
      if (isDirty.current) {
        save(content);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [content, enabled, save]);

  // ── Periodic save every 2s while dirty ──────────────────
  useEffect(() => {
    if (!enabled) return;

    intervalTimer.current = setInterval(() => {
      if (isDirty.current) {
        save(lastContentRef.current);
      }
    }, INTERVAL_MS);

    return () => {
      if (intervalTimer.current) {
        clearInterval(intervalTimer.current);
      }
    };
  }, [enabled, save]);

  // ── Load version history on mount ───────────────────────
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      setVersionHistory(history);
    } catch {
      setVersionHistory([]);
    }
  }, []);

  // ── Save before unload (safety net) ─────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirty.current && enabled) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            content: lastContentRef.current,
            title: documentTitle,
            savedAt: new Date().toISOString(),
            version: Date.now(),
          }));
        } catch {
          // Can't do much here
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, documentTitle]);

  // ── Restore a specific version ──────────────────────────
  const restoreVersion = useCallback((index) => {
    if (index < 0 || index >= versionHistory.length) return null;
    return versionHistory[index];
  }, [versionHistory]);

  // ── Clear all history ───────────────────────────────────
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      setVersionHistory([]);
    } catch {
      // Silently ignore
    }
  }, []);

  return {
    saveStatus,
    lastSaved,
    documentTitle,
    setDocumentTitle,
    restoreVersion,
    versionHistory,
    clearHistory,
    manualSave,
  };
}

/**
 * Load saved document from localStorage.
 * @returns {{ content: string, title: string, savedAt: string } | null}
 */
export function loadSavedDocument() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.content) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Clear all saved data (for "New Document" action).
 */
export function clearSavedDocument() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TITLE_KEY);
    // Keep history for recovery
  } catch {
    // Silently ignore
  }
}

export default useAutosave;
