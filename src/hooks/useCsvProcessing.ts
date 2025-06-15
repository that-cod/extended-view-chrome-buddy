
import { CSVProcessor } from '@/utils/csvProcessor';

export const useCsvProcessing = () => {
  const processCsvFile = async (file: File) => {
    const csvText = await file.text();
    const csvRows = CSVProcessor.parseCSV(csvText);
    if (csvRows.length === 0) throw new Error('No valid data found in CSV file (file empty or headers missing)');
    const trades = CSVProcessor.mapToTrades(csvRows);
    if (trades.length === 0) {
      // Add a helpful error message listing available and required fields
      const headers = CSVProcessor.extractHeaders(csvRows);
      throw new Error(
        `No valid trades found in file.\nDetected columns: ${headers.join(', ')}.\n` +
        `Required columns: Date, Symbol, Action, Volume, Price. Please check your CSV for correct column names.`
      );
    }
    return trades;
  };
  return { processCsvFile };
};
