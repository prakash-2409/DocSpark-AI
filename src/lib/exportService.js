/**
 * Export Service
 * 
 * Exports editor content to PDF, DOCX, or TXT.
 * All processing happens locally in the browser.
 */

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { trackAndStamp } from './exportLimit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/* ------------------------------------------------------------------ */
/*  PDF Export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Export the current editor content to PDF.
 * Uses jsPDF's html() method to render the editor DOM directly.
 * 
 * @param {string} fileName - name for the downloaded file (without extension)
 * @returns {Promise<void>}
 */
export async function exportToPDF(fileName = 'document') {
  const editorContent = document.querySelector('.ProseMirror');
  if (!editorContent) throw new Error('Editor content not found');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Force light styles for export so dark mode doesn't bleed in
  const origColor = editorContent.style.color;
  const origBg = editorContent.style.backgroundColor;
  editorContent.style.color = '#111827';
  editorContent.style.backgroundColor = '#ffffff';

  return new Promise((resolve, reject) => {
    doc.html(editorContent, {
      callback: function (pdf) {
        // Restore original styles
        editorContent.style.color = origColor;
        editorContent.style.backgroundColor = origBg;
        trackAndStamp(pdf);
        pdf.save(`${fileName}.pdf`);
        resolve();
      },
      x: 10,
      y: 10,
      width: 190, // A4 width (210) minus margins
      windowWidth: 800,
    });
  });
}

/* ------------------------------------------------------------------ */
/*  DOCX Export                                                        */
/* ------------------------------------------------------------------ */

/**
 * Export editor content to DOCX.
 * Parses the HTML into paragraphs and runs.
 * 
 * @param {object} editor - TipTap editor instance
 * @param {string} fileName
 */
export async function exportToDOCX(editor, fileName = 'document') {
  if (!editor) throw new Error('No editor instance');

  const htmlContent = editor.getHTML();

  // Parse the HTML into structured paragraphs
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
  const elements = htmlDoc.body.children;

  const children = [];

  for (const el of elements) {
    const tagName = el.tagName.toLowerCase();

    // Determine heading level
    let headingLevel = null;
    if (tagName === 'h1') headingLevel = HeadingLevel.HEADING_1;
    else if (tagName === 'h2') headingLevel = HeadingLevel.HEADING_2;
    else if (tagName === 'h3') headingLevel = HeadingLevel.HEADING_3;

    // Handle lists
    if (tagName === 'ul' || tagName === 'ol') {
      const items = el.querySelectorAll('li');
      items.forEach((li, index) => {
        children.push(
          new Paragraph({
            children: parseInlineElements(li),
            bullet: tagName === 'ul' ? { level: 0 } : undefined,
            numbering: tagName === 'ol' ? { reference: 'default-numbering', level: 0 } : undefined,
          })
        );
      });
      continue;
    }

    // Handle tables — convert to paragraph representation
    if (tagName === 'table') {
      const rows = el.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        const cellTexts = Array.from(cells).map(c => c.textContent.trim());
        children.push(
          new Paragraph({
            children: [new TextRun(cellTexts.join(' | '))],
          })
        );
      });
      continue;
    }

    // Regular paragraphs and headings
    children.push(
      new Paragraph({
        children: parseInlineElements(el),
        heading: headingLevel || undefined,
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children.length > 0 ? children : [new Paragraph({ children: [new TextRun('')] })],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

/**
 * Parse inline elements (bold, italic, underline) from an HTML element.
 */
function parseInlineElements(element) {
  const runs = [];

  function traverse(node, styles = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        runs.push(new TextRun({
          text,
          bold: styles.bold || false,
          italics: styles.italic || false,
          underline: styles.underline ? {} : undefined,
          strike: styles.strike || false,
        }));
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      const newStyles = { ...styles };

      if (tag === 'strong' || tag === 'b') newStyles.bold = true;
      if (tag === 'em' || tag === 'i') newStyles.italic = true;
      if (tag === 'u') newStyles.underline = true;
      if (tag === 's' || tag === 'del') newStyles.strike = true;

      for (const child of node.childNodes) {
        traverse(child, newStyles);
      }
    }
  }

  for (const child of element.childNodes) {
    traverse(child);
  }

  return runs.length > 0 ? runs : [new TextRun('')];
}

/* ------------------------------------------------------------------ */
/*  TXT Export                                                         */
/* ------------------------------------------------------------------ */

/**
 * Export editor content to plain text.
 * 
 * @param {object} editor - TipTap editor instance
 * @param {string} fileName
 */
export function exportToTXT(editor, fileName = 'document') {
  if (!editor) throw new Error('No editor instance');
  const text = editor.getText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.txt`);
}

export default { exportToPDF, exportToDOCX, exportToTXT };
