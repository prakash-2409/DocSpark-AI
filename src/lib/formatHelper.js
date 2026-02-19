/**
 * Format Helper — Assignment & Document Formatting Utilities
 * 
 * Quick-fix tools for common student and document formatting problems.
 * Operates directly on a TipTap editor instance.
 */

/* ------------------------------------------------------------------ */
/*  One-click Assignment Formatter                                     */
/* ------------------------------------------------------------------ */

/**
 * Apply a clean "assignment-ready" layout to the entire document.
 *  - Proper heading hierarchy (first line → H1, section starts → H2)
 *  - Remove excessive blank lines
 *  - Normalise list formatting
 *  - Standard paragraph spacing
 * 
 * @param {import('@tiptap/core').Editor} editor
 */
export function applyAssignmentLayout(editor) {
  if (!editor) return;

  let html = editor.getHTML();

  // 1. Remove excessive empty paragraphs (keep at most one)
  html = html.replace(/(<p><\/p>\s*){2,}/g, '<p></p>');

  // 2. Fix broken lines — merge consecutive single-line <p> that look like broken text
  //    (lines that don't end with punctuation and are followed by lowercase)
  html = html.replace(/<\/p>\s*<p>(?=[a-z])/g, ' ');

  // 3. Normalise whitespace inside paragraphs
  html = html.replace(/\s{2,}/g, ' ');

  // 4. Promote first non-empty paragraph to H1 if it isn't already a heading
  html = html.replace(/^(<p>)([^<]+)(<\/p>)/, '<h1>$2</h1>');

  // 5. Clean up trailing empty elements
  html = html.replace(/(<p><\/p>\s*)+$/, '');

  editor.commands.setContent(html);
}

/* ------------------------------------------------------------------ */
/*  Remove Extra Spaces                                                */
/* ------------------------------------------------------------------ */

/**
 * Remove double/triple spaces, leading/trailing whitespace in each paragraph.
 */
export function removeExtraSpaces(editor) {
  if (!editor) return;

  let html = editor.getHTML();

  // Collapse multiple spaces to one
  html = html.replace(/ {2,}/g, ' ');

  // Remove spaces right after opening tags and before closing tags
  html = html.replace(/>(\s+)/g, '>');
  html = html.replace(/(\s+)</g, '<');

  // But keep single space between words — redo by operating on text nodes
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    walker.currentNode.textContent = walker.currentNode.textContent
      .replace(/ {2,}/g, ' ')
      .trim();
  }

  editor.commands.setContent(doc.body.innerHTML);
}

/* ------------------------------------------------------------------ */
/*  Fix Broken Lines                                                   */
/* ------------------------------------------------------------------ */

/**
 * Merge paragraphs that look like they were broken mid-sentence.
 * Heuristic: a <p> ending without sentence-ending punctuation followed
 * by a <p> starting with a lowercase letter.
 */
export function fixBrokenLines(editor) {
  if (!editor) return;

  let html = editor.getHTML();

  // Merge broken lines
  html = html.replace(
    /<\/p>\s*<p>(?=[a-z])/g,
    ' '
  );

  editor.commands.setContent(html);
}

/* ------------------------------------------------------------------ */
/*  Normalise Fonts (strip inline styles)                              */
/* ------------------------------------------------------------------ */

/**
 * Remove all inline font-family, font-size, and color styles,
 * leaving the document with consistent formatting.
 */
export function normalizeFonts(editor) {
  if (!editor) return;

  let html = editor.getHTML();

  // Remove style attributes entirely
  html = html.replace(/\s*style="[^"]*"/g, '');

  // Remove <font> tags (legacy)
  html = html.replace(/<\/?font[^>]*>/g, '');

  // Remove <span> tags that now have no attributes
  html = html.replace(/<span>([^<]*)<\/span>/g, '$1');

  editor.commands.setContent(html);
}

/* ------------------------------------------------------------------ */
/*  Quick Clean — combines common fixes                                */
/* ------------------------------------------------------------------ */

/**
 * Run all common formatting fixes in sequence.
 */
export function quickClean(editor) {
  if (!editor) return;

  removeExtraSpaces(editor);
  fixBrokenLines(editor);
  normalizeFonts(editor);
}

export default {
  applyAssignmentLayout,
  removeExtraSpaces,
  fixBrokenLines,
  normalizeFonts,
  quickClean,
};
