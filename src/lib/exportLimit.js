/**
 * Export Limit & Watermark Service
 *
 * Tracks how many files the user has downloaded.
 * First 5 downloads are watermark-free.
 * After that, a small "DocHub" watermark is added to every PDF page.
 *
 * Viewing / sharing the original file does NOT count as an export.
 */

const STORAGE_KEY = 'dochub-export-count';
export const FREE_EXPORT_LIMIT = 5;

/* ---- Count helpers ---- */

export function getExportCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
}

export function incrementExportCount() {
  const next = getExportCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export function remainingFreeExports() {
  return Math.max(0, FREE_EXPORT_LIMIT - getExportCount());
}

export function shouldWatermark() {
  return getExportCount() >= FREE_EXPORT_LIMIT;
}

/* ---- Watermark stamper ---- */

/**
 * Stamp a subtle watermark on every page of a jsPDF document.
 * Call this just before `pdf.save()` or `pdf.output()`.
 *
 * @param {import('jspdf').jsPDF} pdf - jsPDF instance
 */
export function stampWatermark(pdf) {
  if (!shouldWatermark()) return;

  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Bottom-right subtle branding
    pdf.setFontSize(9);
    pdf.setTextColor(180, 180, 180);      // light grey
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.text('DocHub — dochub.local', pageW - 10, pageH - 8, { align: 'right' });

    // Diagonal centre watermark (very faint)
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.06 }));
    pdf.setFontSize(54);
    pdf.setTextColor(120, 120, 120);
    const cx = pageW / 2;
    const cy = pageH / 2;
    pdf.text('DocHub', cx, cy, {
      align: 'center',
      angle: 45,
    });
    pdf.restoreGraphicsState();
  }
}

/**
 * Convenience: increment count + stamp watermark on a jsPDF doc.
 * Call right before pdf.save().
 */
export function trackAndStamp(pdf) {
  incrementExportCount();
  stampWatermark(pdf);
}

export default {
  getExportCount,
  incrementExportCount,
  remainingFreeExports,
  shouldWatermark,
  stampWatermark,
  trackAndStamp,
  FREE_EXPORT_LIMIT,
};
