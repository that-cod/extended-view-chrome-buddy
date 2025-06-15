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
import { useUploadHandler } from '@/hooks/useUploadHandler';

// FIX: Import PDF.js correctly (no default export, use named module)
import * as pdfjsLib from 'pdfjs-dist';

const Upload = () => {
  const {
    uploadStatus,
    fileName,
    analysisResults,
    errorMessage,
    isExporting,
    handleFileUpload,
    handleExport,
    resetUpload,
  } = useUploadHandler();

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
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
                  onChange={onFileInputChange}
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
                  {'totalTrades' in analysisResults
                    ? analysisResults.totalTrades
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Total Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {'winRate' in analysisResults && typeof analysisResults.winRate === "number"
                    ? `${Math.round(analysisResults.winRate)}%`
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {'emotionalPatterns' in analysisResults
                    ? analysisResults.emotionalPatterns
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Emotional Patterns Detected</div>
              </div>
            </div>
            
            {'insights' in analysisResults && analysisResults.insights && (
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
