import * as pdfjsLib from 'pdfjs-dist';

// Set up workerSrc for PDF.js for Vite (use .mjs for pdfjs-dist >4)
// This must match the correct worker file included in Vite config
if ((window as any).Worker) {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.env.BASE_URL
    ? `${import.meta.env.BASE_URL}pdf.worker.mjs`
    : '/pdf.worker.mjs';
}

// Utility: PDF extraction now offloads parsing using a web worker
export const usePdfTextExtract = () => {
  // Returns a function to extract lines from pdf file
  const extractTextLines = async (file: File): Promise<string[]> => {
    // Try to use web worker for extraction
    if ('Worker' in window) {
      try {
        const WorkerCtor = await import('../workers/pdfText.worker?worker');
        const worker = new WorkerCtor.default();
        return new Promise((resolve) => {
          worker.onmessage = (e: MessageEvent) => {
            if (e.data && e.data.success) {
              resolve(e.data.lines);
            } else {
              // If worker failed, fallback to main-thread parsing
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
      } catch (err) {
        // fallback to original method below
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
        const pageLines = textContent.items
          .map((item: any) => (item && item.str ? item.str : ''))
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
