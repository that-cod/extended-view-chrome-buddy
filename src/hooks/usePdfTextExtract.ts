
import * as pdfjsLib from 'pdfjs-dist';

// Set up workerSrc for PDF.js for Vite (use .mjs for pdfjs-dist >4)
// This must match the correct worker file included in Vite config
if ((window as any).Worker) {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.env.BASE_URL
    ? `${import.meta.env.BASE_URL}pdf.worker.mjs`
    : '/pdf.worker.mjs';
}

// Extract all lines of text from a PDF file, with robust error handling
export const usePdfTextExtract = () => {
  // Returns a function to extract lines from pdf file
  const extractTextLines = async (file: File): Promise<string[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let lines: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Only extract actual text, ignore empty/undefined
        const pageLines = textContent.items
          .map((item: any) => (item && item.str ? item.str : ''))
          .join(' ')
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        lines.push(...pageLines);
      }
      // If we somehow have no lines, return at least a blank array (not error)
      return lines;
    } catch (err) {
      console.error('Error extracting PDF text:', err);
      // Return a special error indicator (also empty array for old handler compatibility)
      return [];
    }
  };
  return { extractTextLines };
};
