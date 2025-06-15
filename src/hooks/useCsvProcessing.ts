
import { CSVProcessor } from '@/utils/csvProcessor';

export const useCsvProcessing = () => {
  const processCsvFile = async (file: File) => {
    const csvText = await file.text();
    const csvRows = CSVProcessor.parseCSV(csvText);
    if (csvRows.length === 0) throw new Error('No valid data found in CSV file');
    return CSVProcessor.mapToTrades(csvRows);
  };
  return { processCsvFile };
};
