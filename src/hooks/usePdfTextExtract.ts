
import * as pdfjsLib from 'pdfjs-dist';

// Extract all lines of text from a PDF file
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
        const pageLines = textContent.items.map((item: any) => item.str || '').join(' ').split('\n');
        pageLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed) lines.push(trimmed);
        });
      }
      return lines;
    } catch (err) {
      console.error('Error extracting PDF text:', err);
      return [];
    }
  };
  return { extractTextLines };
};
