
// Web Worker to extract text from PDF
import * as pdfjsLib from 'pdfjs-dist';

function isTextItem(item: unknown): item is { str: string } {
  return typeof item === 'object' && item !== null && 'str' in item && typeof (item as any).str === 'string';
}

self.onmessage = async (e: MessageEvent<{ fileBuffer: ArrayBuffer }>) => {
  const { fileBuffer } = e.data;
  try {
    // @ts-ignore
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
    let lines: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageLines = (textContent.items as unknown[])
        .filter(isTextItem)
        .map((item) => item.str)
        .join(' ')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      lines.push(...pageLines);
    }
    self.postMessage({ success: true, lines });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    self.postMessage({ success: false, error: errorMessage });
  }
};
