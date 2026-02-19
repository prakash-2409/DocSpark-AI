/**
 * File Parser Service
 * 
 * Opens any supported file type and converts it to editor-ready HTML.
 * Supported: .txt, .docx, .pdf, .csv, .xlsx
 * 
 * All parsing happens locally in the browser — nothing is uploaded.
 */

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up the PDF.js worker from local node_modules (Vite resolves the URL)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Parse a File object into editor-ready HTML.
 * @param {File} file - browser File object from <input> or drag-and-drop
 * @returns {Promise<{ htmlContent: string, type: string, rawData: Uint8Array }>}
 */
export async function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const rawData = new Uint8Array(await file.arrayBuffer());

  // Image files — store raw bytes, no text extraction
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  if (imageExts.includes(ext)) {
    return { htmlContent: `<p><em>Image file: ${file.name}</em></p>`, type: 'image', rawData };
  }

  switch (ext) {
    case 'txt':
    case 'md':
    case 'markdown':
      return { htmlContent: await parseTxt(rawData), type: 'txt', rawData };
    case 'doc':
    case 'docx':
      return { htmlContent: await parseDocx(rawData), type: 'docx', rawData };
    case 'pdf':
      return { htmlContent: await parsePdf(rawData), type: 'pdf', rawData };
    case 'csv':
      return { htmlContent: await parseCsv(rawData), type: 'csv', rawData };
    case 'xls':
    case 'xlsx':
      return { htmlContent: await parseXlsx(rawData), type: 'xlsx', rawData };
    default:
      // Try to read as plain text fallback
      return { htmlContent: await parseTxt(rawData), type: 'txt', rawData };
  }
}

/* ------------------------------------------------------------------ */
/*  Individual parsers                                                 */
/* ------------------------------------------------------------------ */

/** Plain text → HTML paragraphs */
async function parseTxt(rawData) {
  const text = new TextDecoder('utf-8').decode(rawData);
  const lines = text.split(/\r?\n/);
  return lines
    .map(line => {
      if (line.trim() === '') return '<p></p>';
      // Escape HTML entities
      const safe = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<p>${safe}</p>`;
    })
    .join('');
}

/** DOCX → HTML via mammoth */
async function parseDocx(rawData) {
  const result = await mammoth.convertToHtml({ arrayBuffer: rawData.buffer });
  // mammoth returns clean semantic HTML
  return result.value || '<p></p>';
}

/** PDF → HTML (text extraction) using pdf.js */
async function parsePdf(rawData) {
  try {
    const pdf = await pdfjsLib.getDocument({ data: rawData.slice() }).promise;
    const paragraphs = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Group text items by their Y position to form lines
      const lines = {};
      for (const item of textContent.items) {
        if (!item.str) continue;
        // Round Y to group items on the same line
        const y = Math.round(item.transform[5]);
        if (!lines[y]) lines[y] = [];
        lines[y].push(item.str);
      }

      // Sort by Y (descending, since PDF Y goes bottom-up)
      const sortedYs = Object.keys(lines)
        .map(Number)
        .sort((a, b) => b - a);

      for (const y of sortedYs) {
        const lineText = lines[y].join(' ').trim();
        if (lineText) {
          const safe = lineText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          paragraphs.push(`<p>${safe}</p>`);
        }
      }

      // Page separator
      if (i < pdf.numPages) {
        paragraphs.push('<hr />');
      }
    }

    return paragraphs.join('') || '<p></p>';
  } catch (err) {
    console.error('PDF parsing failed:', err);
    return '<p><em>Could not extract text from this PDF. It may be image-based or encrypted.</em></p>';
  }
}

/** CSV → HTML table */
async function parseCsv(rawData) {
  const text = new TextDecoder('utf-8').decode(rawData);
  const workbook = XLSX.read(text, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return sheetToHtmlTable(sheet);
}

/** XLSX → HTML table */
async function parseXlsx(rawData) {
  const workbook = XLSX.read(rawData, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return sheetToHtmlTable(sheet);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert a SheetJS worksheet to an HTML table string */
function sheetToHtmlTable(sheet) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!data.length) return '<p>Empty spreadsheet</p>';

  let html = '<table><tbody>';

  // First row as header
  html += '<tr>';
  for (const cell of data[0]) {
    const safe = String(cell)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html += `<th>${safe}</th>`;
  }
  html += '</tr>';

  // Remaining rows
  for (let r = 1; r < data.length; r++) {
    html += '<tr>';
    for (const cell of data[r]) {
      const safe = String(cell)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html += `<td>${safe}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}

/**
 * Get a human-readable file type label.
 */
export function getFileTypeLabel(type) {
  const labels = {
    txt: 'Text',
    docx: 'Word',
    pdf: 'PDF',
    csv: 'CSV',
    xlsx: 'Excel',
    image: 'Image',
    new: 'Document',
  };
  return labels[type] || 'Document';
}

/**
 * Get a file icon color based on type.
 */
export function getFileTypeColor(type) {
  const colors = {
    txt: 'text-gray-500',
    docx: 'text-blue-600',
    pdf: 'text-red-500',
    csv: 'text-green-600',
    xlsx: 'text-emerald-600',
    image: 'text-purple-500',
    new: 'text-indigo-500',
  };
  return colors[type] || 'text-gray-500';
}

export default { parseFile, getFileTypeLabel, getFileTypeColor };
