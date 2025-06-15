
// Web Worker to extract text from PDF
import * as pdfjsLib from 'pdfjs-dist';

self.onmessage = async (e) => {
  const { fileBuffer } = e.data;
  try {
    // Setup workerSrc for PDF.js, as in main setup
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    let lines = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageLines = textContent.items
        .map((item) => (item && item.str ? item.str : ''))
        .join(' ')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      lines.push(...pageLines);
    }
    self.postMessage({ success: true, lines });
  } catch (error) {
    self.postMessage({ success: false, error: error && error.message ? error.message : String(error) });
  }
};
