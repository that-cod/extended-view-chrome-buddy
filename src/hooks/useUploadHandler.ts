import { useToast } from "@/hooks/use-toast";
import { useTradingData } from '@/hooks/useTradingData';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { usePdfTextExtract } from './usePdfTextExtract';
import { useCsvProcessing } from './useCsvProcessing';
import { useState } from 'react';
import { z } from "zod";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const useUploadHandler = () => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const { invalidateData } = useTradingData();
  const { updateUser } = useAuth();

  const { extractTextLines } = usePdfTextExtract();
  const { processCsvFile } = useCsvProcessing();

  // Enhanced file validation schema
  const AllowedMimeTypes = [
    "text/csv",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  // Validation
  const validateFile = (file: File): boolean => {
    const schema = z.object({
      name: z.string().min(1),
      size: z.number().max(MAX_FILE_SIZE),
      type: z.string().refine(
        (val) =>
          AllowedMimeTypes.includes(val) ||
          file.name.toLowerCase().endsWith(".csv") ||
          file.name.toLowerCase().endsWith(".pdf"),
        { message: "File must be a CSV or PDF." }
      ),
    });

    const result = schema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!result.success) {
      setErrorMessage(
        result.error.errors[0]?.message || "Please upload a valid CSV or PDF file"
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size must be less than 10MB");
      return false;
    }

    // Check CSV file extra: ensure it has minimum required lines (header + 1 data row) if possible
    if (
      (file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv")) &&
      typeof FileReader !== "undefined"
    ) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result as string;
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          setErrorMessage("CSV file must contain at least one data row.");
          setStatus("error");
        }
      };
      reader.readAsText(file);
    }
    return true;
  };

  // Main handler
  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) {
      setStatus('error');
      return;
    }
    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage('');
    let processedData: any[] = [];
    let pdfRawText: string[] = [];
    let isPDF = false;
    try {
      const statement = await SupabaseService.createUploadedStatement(file.name, file.size, file.type);
      if (!statement) throw new Error('Failed to create statement record');
      await SupabaseService.updateStatementStatus(statement.id, 'processing');

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        isPDF = true;
        pdfRawText = await extractTextLines(file);

        // **New Error Handling Here:**
        if (pdfRawText === undefined || pdfRawText === null) {
          throw new Error('Could not read any text from PDF file. Please try a different PDF or export.');
        }
        // If extracted but zero or nearly zero lines, customized feedback
        if (pdfRawText.length === 0) {
          throw new Error(
            'No readable text found in your PDF. Check if the PDF is a scanned document or try exporting a fresh copy from your broker.'
          );
        }
        // If all are whitespace/empty (should not happen now):
        if (pdfRawText.every(line => !line.trim())) {
          throw new Error(
            'PDF extracted but contains only blank or whitespace lines. Try exporting a new PDF statement from your broker.'
          );
        }

        // We always pass raw text (not structured table!) for PDF
        processedData = [{ statementId: statement.id, rawText: pdfRawText.join('\n') }];
      } else {
        processedData = await processCsvFile(file);
      }

      let insertedTrades = null;
      if (!isPDF) {
        if (processedData.length === 0) {
          throw new Error('No valid trades found in file. Please check the format.');
        }
        insertedTrades = await SupabaseService.insertTrades(processedData, statement.id);
        if (!insertedTrades) throw new Error('Failed to save trades to database');
      }

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
            pdfRawText.length >= 1
              ? `Extracted ${pdfRawText.length} lines of text from your PDF.`
              : 'All text extracted from PDF.',
            'No structured trade parsing applied. Please analyze lines manually.'
          ]
        };
      }

      await SupabaseService.updateStatementStatus(statement.id, 'completed');
      setStatus('success');
      setResults(analysis);
      updateUser({ hasUploadedStatement: true });
      invalidateData();
      toast({
        title: "Upload Successful",
        description: isPDF
          ? `${file.name} has been uploaded: ${pdfRawText.length} lines extracted as text.`
          : `${file.name} has been processed. Found ${insertedTrades.length} trades.`,
      });
    } catch (error) {
      setStatus('error');
      // Use more descriptive error message for PDF and others. Fallback if not Error instance
      let msg =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'Failed to upload and process file';
      setErrorMessage(msg);
      toast({
        title: "Upload Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  // Export logic
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
    setStatus('idle');
    setFileName('');
    setResults(null);
    setErrorMessage('');
  };

  return {
    uploadStatus: status,
    fileName,
    analysisResults: results,
    errorMessage,
    isExporting,
    handleFileUpload,
    handleExport,
    resetUpload,
  };
};
