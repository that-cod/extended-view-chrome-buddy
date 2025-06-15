
import * as pdfjsLib from 'pdfjs-dist';
import { PDF_WORKER_SRC } from '@/constants/app';

// Set up workerSrc for PDF.js for Vite (use .mjs for pdfjs-dist >4)
if ((window as any).Worker) {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
}

type ExtractTextResult = string[];

function isTextItem(item: unknown): item is { str: string } {
  return typeof item === "object" && item !== null && "str" in item && typeof (item as any).str === "string";
}

export const usePdfTextExtract = () => {
  // Returns a function to extract lines from pdf file
  const extractTextLines = async (file: File): Promise<ExtractTextResult> => {
    if ('Worker' in window) {
      try {
        const WorkerCtor = await import('../workers/pdfText.worker?worker');
        const worker: Worker = new WorkerCtor.default();
        return new Promise((resolve) => {
          worker.onmessage = (e: MessageEvent) => {
            if (e.data && e.data.success) {
              resolve(e.data.lines as ExtractTextResult);
            } else {
              resolve([]);
            }
            worker.terminate();
          };
          worker.onerror = () => {
            resolve([]);
            worker.terminate();
          };
          file.arrayBuffer().then(buffer => {
            worker.postMessage({ fileBuffer: buffer });
          });
        });
      } catch {
        // fallback to main-thread parsing
      }
    }

    // fallback: parse in main thread
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
      return lines;
    } catch (err) {
      console.error('Error extracting PDF text:', err);
      return [];
    }
  };
  return { extractTextLines };
};
