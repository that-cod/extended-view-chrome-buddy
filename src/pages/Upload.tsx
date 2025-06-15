import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTradingData } from '@/hooks/useTradingData';
import { useAuth } from '@/contexts/AuthContext';
import { CSVProcessor } from '@/utils/csvProcessor';
import { SupabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

// FIX: Import PDF.js correctly (no default export, use named module)
import * as pdfjsLib from 'pdfjs-dist';

const Upload = () => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { invalidateData } = useTradingData();
  const { updateUser } = useAuth();

  // Updated validation: Accept CSV or PDF files
  const validateFile = (file: File): boolean => {
    const isCSV = file.type.includes('csv') || file.name.toLowerCase().endsWith('.csv');
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isCSV && !isPDF) {
      setErrorMessage('Please upload a valid CSV or PDF file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  // Helper function to extract all text lines from PDF (no structure, just raw lines)
  const parsePDFFile = async (file: File): Promise<string[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let lines: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Each item is a chunk of text on the page
        const pageLines = textContent.items.map((item: any) => item.str).join(' ').split('\n');
        // Collect & push non-empty lines
        pageLines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed) lines.push(trimmed);
        });
      }
      return lines;
    } catch (err) {
      console.error('Error extracting PDF text:', err);
      setErrorMessage('Failed to extract data from PDF file. Please check PDF format.');
      return [];
    }
  };

  // Modified file upload handler to support both CSV and PDF (raw PDF text version)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');
    setErrorMessage('');

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    let processedData: any[] = [];
    let pdfRawText: string[] = [];
    let isPDF = false;
    try {
      // Create uploaded statement record
      const statement = await SupabaseService.createUploadedStatement(
        file.name,
        file.size,
        file.type
      );

      if (!statement) throw new Error('Failed to create statement record');

      await SupabaseService.updateStatementStatus(statement.id, 'processing');

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        isPDF = true;
        // Just extract all lines of text from the PDF, don't map to trade fields
        pdfRawText = await parsePDFFile(file);
        if (!pdfRawText || pdfRawText.length === 0) throw new Error('No data found in PDF file');

        // Option A: Save as one "raw" text blob (better for non-structured parsing)
        processedData = [{ statementId: statement.id, rawText: pdfRawText.join('\n') }];
        // Option B: Or if you want, each line as a record (less common)
        // processedData = pdfRawText.map(line => ({ statementId: statement.id, rawText: line }));

        // No insertion to trades table since we have no structured fields, just mark complete
      } else {
        // CSV flow (original)
        const csvText = await file.text();
        console.log('CSV content length:', csvText.length);

        const csvRows = CSVProcessor.parseCSV(csvText);
        if (csvRows.length === 0) throw new Error('No valid data found in CSV file');

        processedData = CSVProcessor.mapToTrades(csvRows);
      }

      console.log('Processed data:', processedData.length);

      // Insert trades only if we have structured data (CSV)
      let insertedTrades = null;
      if (!isPDF) {
        if (processedData.length === 0) {
          throw new Error('No valid trades found in file. Please check the format.');
        }

        insertedTrades = await SupabaseService.insertTrades(processedData, statement.id);

        if (!insertedTrades) throw new Error('Failed to save trades to database');
      }

      // Run analysis for CSV, but for PDF just show raw text results
      let analysis;
      if (!isPDF) {
        const res = await supabase.functions.invoke('analyze-trading-data', {
          body: { statementId: statement.id }
        });
        analysis = res.data || {
          totalTrades: insertedTrades.length,
          winRate: Math.round((insertedTrades.filter(t => t.profit > 0).length / insertedTrades.length) * 100),
          insights: 'Analysis completed successfully'
        };
      } else {
        analysis = {
          rawText: pdfRawText,
          totalLines: pdfRawText.length,
          insights: [
            'All text extracted from PDF.',
            'No structured trade parsing applied. Please analyze lines manually.'
          ]
        }
      }

      await SupabaseService.updateStatementStatus(statement.id, 'completed');

      setUploadStatus('success');
      setAnalysisResults(analysis);

      updateUser({ hasUploadedStatement: true });
      invalidateData();

      toast({
        title: "Upload Successful",
        description: isPDF
          ? `${file.name} has been uploaded and its text extracted.`
          : `${file.name} has been processed. Found ${insertedTrades.length} trades.`,
      });

      console.log('Upload successful. Data processed:', processedData.length);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload and process file');
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload and process file',
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    setIsExporting(true);
    try {
      const exportData = await SupabaseService.exportData(format);
      if (!exportData) {
        throw new Error('No data to export');
      }

      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-data-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Your trading data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setAnalysisResults(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Trading Statement</h1>
        <p className="text-gray-400">Upload your CSV or PDF trading statement for behavioral analysis</p>
      </div>

      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">CSV or PDF Trading Statement Upload</CardTitle>
          <CardDescription className="text-gray-400">
            Upload your trading history as a <span className="font-semibold">CSV</span> <b>or</b> <span className="font-semibold">PDF</span> file. We support most broker formats including MT4, MT5, Interactive Brokers, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center relative">
            {uploadStatus === 'idle' && (
              <>
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">Drop your CSV or PDF file here</h3>
                  <p className="text-gray-400">or click to browse</p>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
                <input
                  type="file"
                  accept=".csv,application/pdf,.pdf,text/csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <div>
                  <h3 className="text-lg font-medium text-white">Processing {fileName}</h3>
                  <p className="text-gray-400">Analyzing your trading data...</p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <div>
                  <h3 className="text-lg font-medium text-white">Upload Successful!</h3>
                  <p className="text-gray-400">Your trading data has been processed and analyzed</p>
                  <p className="text-sm text-green-400 mt-2">{fileName}</p>
                </div>
                <Button onClick={resetUpload} variant="outline" className="mt-4">
                  Upload Another File
                </Button>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <div>
                  <h3 className="text-lg font-medium text-white">Upload Failed</h3>
                  <p className="text-gray-400">{errorMessage || 'Please ensure you\'re uploading a valid CSV or PDF file'}</p>
                  <p className="text-sm text-red-400 mt-2">{fileName}</p>
                </div>
                <Button onClick={resetUpload} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1c2027] border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Supported Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• MetaTrader 4/5 CSV exports</li>
                  <li>• Interactive Brokers statements (CSV or PDF)</li>
                  <li>• TradingView export data</li>
                  <li>• Custom CSV with standard columns</li>
                  <li>• PDF files with tabular trade history (experimental)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1c2027] border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white">Required Columns</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Date/Time</li>
                  <li>• Symbol/Instrument</li>
                  <li>• Buy/Sell action</li>
                  <li>• Volume/Quantity</li>
                  <li>• Profit/Loss</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {uploadStatus === 'success' && analysisResults && (
        <Card className="bg-[#232833] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {analysisResults.totalTrades || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analysisResults.winRate ? `${Math.round(analysisResults.winRate)}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analysisResults.emotionalPatterns || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Emotional Patterns Detected</div>
              </div>
            </div>
            
            {analysisResults.insights && (
              <div className="mt-4 p-4 bg-[#1c2027] rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Key Insights:</h4>
                {Array.isArray(analysisResults.insights) ? (
                  <ul className="text-sm text-gray-300 space-y-1">
                    {analysisResults.insights.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-300">{analysisResults.insights}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#232833] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            Export your trading data for external analysis or backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => handleExport('json')} 
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? 'Exporting...' : 'Export as JSON'}
            </Button>
            <Button 
              onClick={() => handleExport('csv')} 
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
