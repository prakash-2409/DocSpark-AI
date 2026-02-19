/**
 * Local Document Storage using IndexedDB
 * 
 * Provides persistent local file storage that survives refresh and app restart.
 * No cloud storage — everything stays on the user's device.
 * 
 * Schema:
 *   id          - unique string (crypto.randomUUID)
 *   name        - display name (editable)
 *   type        - original file extension: 'txt' | 'docx' | 'pdf' | 'csv' | 'xlsx' | 'new'
 *   rawData     - original file bytes (Uint8Array) for re-export, null for new docs
 *   htmlContent - editor-ready HTML string
 *   size        - file size in bytes
 *   createdAt   - ISO timestamp
 *   updatedAt   - ISO timestamp (last save)
 *   lastOpenedAt- ISO timestamp
 */

import { openDB } from 'idb';

const DB_NAME = 'DocHubLocalStore';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

/**
 * Open (or create) the IndexedDB database.
 * Called lazily — first access initialises the DB.
 */
function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastOpenedAt', 'lastOpenedAt');
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('name', 'name');
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  CRUD helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Save a brand-new document to the store.
 * @param {{ name: string, type: string, rawData?: Uint8Array|null, htmlContent: string, size?: number }} doc
 * @returns {Promise<string>} the generated id
 */
export async function saveFile(doc) {
  const db = await getDB();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const record = {
    id,
    name: doc.name || 'Untitled',
    type: doc.type || 'new',
    rawData: doc.rawData || null,
    htmlContent: doc.htmlContent || '<p></p>',
    size: doc.size || 0,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };

  await db.put(STORE_NAME, record);
  return id;
}

/**
 * Update an existing document (partial update).
 */
export async function updateFile(id, changes) {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id);
  if (!existing) throw new Error(`Document ${id} not found`);

  const updated = {
    ...existing,
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  await db.put(STORE_NAME, updated);
  return updated;
}

/**
 * Get a single document by id.
 */
export async function getFile(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

/**
 * Get all documents, sorted by lastOpenedAt descending.
 */
export async function getAllFiles() {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt));
}

/**
 * Delete a document by id.
 */
export async function deleteFile(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}

/**
 * Rename a document.
 */
export async function renameFile(id, newName) {
  return updateFile(id, { name: newName });
}

/**
 * Touch lastOpenedAt (called when a doc is opened in editor).
 */
export async function touchLastOpened(id) {
  return updateFile(id, { lastOpenedAt: new Date().toISOString() });
}

/**
 * Count total documents in the store.
 */
export async function getFileCount() {
  const db = await getDB();
  return db.count(STORE_NAME);
}

/* ------------------------------------------------------------------ */
/*  Backup & Restore                                                   */
/* ------------------------------------------------------------------ */

/**
 * Export the entire local library as a single JSON blob for backup.
 * Converts Uint8Array rawData to base64 strings for safe serialisation.
 * @returns {Promise<Blob>} a .json blob ready for download
 */
export async function exportLibrary() {
  const files = await getAllFiles();
  const serialised = files.map(f => ({
    ...f,
    rawData: f.rawData ? uint8ToBase64(f.rawData) : null,
    _rawEncoding: f.rawData ? 'base64' : null,
  }));
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'DocHub',
    documents: serialised,
  };
  return new Blob([JSON.stringify(payload)], { type: 'application/json' });
}

/**
 * Import (restore) a previously exported library backup.
 * Merges documents — existing docs with same id are overwritten, new ones are added.
 * @param {File} file  the .json backup file
 * @returns {Promise<{ imported: number, skipped: number }>}
 */
export async function importLibrary(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload?.documents || !Array.isArray(payload.documents)) {
    throw new Error('Invalid backup file format');
  }

  const db = await getDB();
  let imported = 0;
  let skipped = 0;

  for (const doc of payload.documents) {
    try {
      const record = {
        ...doc,
        rawData: doc._rawEncoding === 'base64' && doc.rawData
          ? base64ToUint8(doc.rawData)
          : doc.rawData || null,
      };
      delete record._rawEncoding;
      await db.put(STORE_NAME, record);
      imported++;
    } catch {
      skipped++;
    }
  }

  return { imported, skipped };
}

/**
 * Estimate total storage used by all documents (in bytes).
 */
export async function getStorageUsage() {
  const files = await getAllFiles();
  let totalBytes = 0;
  for (const f of files) {
    totalBytes += f.size || 0;
    if (f.rawData) totalBytes += f.rawData.byteLength || f.rawData.length || 0;
    if (f.htmlContent) totalBytes += new Blob([f.htmlContent]).size;
  }
  return { totalBytes, fileCount: files.length };
}

/* ---- Helpers ---- */
function uint8ToBase64(uint8) {
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(uint8[i]);
  return btoa(binary);
}

function base64ToUint8(base64) {
  const binary = atob(base64);
  const uint8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);
  return uint8;
}

export default {
  saveFile,
  updateFile,
  getFile,
  getAllFiles,
  deleteFile,
  renameFile,
  touchLastOpened,
  getFileCount,
  exportLibrary,
  importLibrary,
  getStorageUsage,
};
