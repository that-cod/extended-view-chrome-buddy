import { useToast } from "@/hooks/use-toast";
import { useTradingData } from '@/hooks/useTradingData';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';
import { usePdfTextExtract } from './usePdfTextExtract';
import { useCsvProcessing } from './useCsvProcessing';
import { useState } from 'react';
import { z } from "zod";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, ERROR_MESSAGES, UploadStatus } from "@/constants/app";
import { logAndExtractMessage } from "@/utils/errorHandler";

// Better types
type ProcessedTrade = {
  date: string;
  symbol: string;
  action: string;
  volume: number;
  price: number;
  profit: number;
  // Possibly more fields
};

type FileAnalysisResult =
  | {
      statementId?: string;
      rawText?: string;
    }
  | {
      insights?: string | string[];
      rawText?: string[];
      totalLines?: number;
      totalTrades?: number;
      winRate?: number;
      emotionalPatterns?: string;
    };

export const useUploadHandler = () => {
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.Idle);
  const [fileName, setFileName] = useState<string>('');
  const [results, setResults] = useState<FileAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const { invalidateData } = useTradingData();
  const { updateUser } = useAuth();

  const { extractTextLines } = usePdfTextExtract();
  const { processCsvFile } = useCsvProcessing();

  // Structured logger: logs with context for debugging
  function logWithContext(context: string, details: object = {}) {
    console.log(`[UploadHandler:${context}]`, details);
  }

  // Validation
  const validateFile = (file: File): boolean => {
    const schema = z.object({
      name: z.string().min(1),
      size: z.number().max(MAX_FILE_SIZE_BYTES, { message: ERROR_MESSAGES.FILE_SIZE }),
      type: z.string().refine(
        (val) =>
          ALLOWED_MIME_TYPES.includes(val) ||
          file.name.toLowerCase().endsWith(".csv") ||
          file.name.toLowerCase().endsWith(".pdf"),
        { message: ERROR_MESSAGES.FILE_TYPE }
      ),
    });

    const result = schema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!result.success) {
      setErrorMessage(result.error.errors[0]?.message || ERROR_MESSAGES.FILE_TYPE);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(ERROR_MESSAGES.FILE_SIZE);
      return false;
    }

    // CSV: check for minimum lines (header + at least 1 row)
    if (
      (file.type.includes("csv") || file.name.toLowerCase().endsWith(".csv")) &&
      typeof FileReader !== "undefined"
    ) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = (e.target?.result as string) || "";
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          setErrorMessage(ERROR_MESSAGES.CSV_MIN_ROWS);
          setStatus(UploadStatus.Error);
        }
      };
      reader.readAsText(file);
    }
    return true;
  };

  // Main handler
  const handleFileUpload = async (file: File) => {
    logWithContext('handleFileUpload.start', { fileName: file.name, fileSize: file.size, fileType: file.type });
    if (!validateFile(file)) {
      setStatus(UploadStatus.Error);
      logWithContext('validateFile.failed', { fileName: file.name });
      return;
    }
    setFileName(file.name);
    setStatus(UploadStatus.Uploading);
    setErrorMessage('');
    let processedData: FileAnalysisResult[] = [];
    let pdfRawText: string[] = [];
    let isPDF = false;
    try {
      const statement = await SupabaseService.createUploadedStatement(file.name, file.size, file.type);
      if (!statement) throw new Error('Failed to create statement record');
      await SupabaseService.updateStatementStatus(statement.id, 'processing');

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        isPDF = true;
        pdfRawText = await extractTextLines(file);

        if (!pdfRawText) {
          logWithContext('pdf.extractTextLines.noText', { fileName: file.name });
          throw new Error(ERROR_MESSAGES.PDF_NO_TEXT);
        }
        if (pdfRawText.length === 0) {
          throw new Error(ERROR_MESSAGES.PDF_NO_TEXT);
        }
        if (pdfRawText.every(line => !line.trim())) {
          throw new Error(ERROR_MESSAGES.PDF_ONLY_WHITESPACE);
        }
        processedData = [{ statementId: statement.id, rawText: pdfRawText.join('\n') }];
      } else {
        logWithContext('processCsvFile.start', { fileName: file.name });
        const trades = await processCsvFile(file);
        processedData = [];
        let insertedTrades = null;
        if (!trades || trades.length === 0) {
          logWithContext('processCsvFile.resultNoTrades', { fileName: file.name });
          throw new Error(ERROR_MESSAGES.NO_VALID_TRADES);
        }
        try {
          insertedTrades = await SupabaseService.insertTrades(trades as any, statement.id);
        } catch (e: any) {
          // Enhanced: surface constraint violation and report in a user-friendly way.
          const errorDetail = typeof e?.message === "string" ? e.message : e?.toString();
          if (
            errorDetail &&
            (errorDetail.includes("duplicate key") || errorDetail.includes("violates")) // Common constraint patterns
          ) {
            setErrorMessage("Duplicate or invalid trade entry. Please check for duplicate trades or missing info.");
            logWithContext('DB.ConstraintViolation', { error: errorDetail });
            toast({
              title: "Constraint Violation",
              description: errorDetail,
              variant: "destructive",
            });
            setStatus(UploadStatus.Error);
            return;
          }
          throw e;
        }
        if (!insertedTrades) {
          throw new Error('Failed to save trades to database');
        }
        let analysis = {
          totalTrades: insertedTrades.length,
          winRate: Math.round((insertedTrades.filter((t: any) => t.profit > 0).length / insertedTrades.length) * 100),
          insights: 'Analysis completed successfully',
        };
        await SupabaseService.updateStatementStatus(statement.id, 'completed');
        logWithContext('upload.success', { count: insertedTrades.length });
        setStatus(UploadStatus.Success);
        setResults(analysis);
        updateUser({ hasUploadedStatement: true });
        invalidateData();
        toast({
          title: "Upload Successful",
          description: `${file.name} has been processed. Found ${(insertedTrades || []).length} trades.`
        });
        return;
      }

      let analysis;
      if (!isPDF) {
        analysis = {};
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
        await SupabaseService.updateStatementStatus(statement.id, 'completed');
        setStatus(UploadStatus.Success);
        setResults(analysis);
        updateUser({ hasUploadedStatement: true });
        invalidateData();
        logWithContext('pdf.upload.success', { lines: pdfRawText.length });
        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded: ${pdfRawText.length} lines extracted as text.`
        });
        return;
      }
    } catch (error: any) {
      setStatus(UploadStatus.Error);
      const msg = logAndExtractMessage(error, ERROR_MESSAGES.UPLOAD_FAIL);
      // Custom: Database constraint violation pretty message
      if (
        typeof error?.message === "string" &&
        (error.message.includes('violates') || error.message.includes('duplicate key'))
      ) {
        setErrorMessage('Database constraint violated — check for duplicate or invalid trades.');
      } else {
        setErrorMessage(msg);
      }
      logWithContext('handleFileUpload.error', { error: error, message: msg });
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
        throw new Error(ERROR_MESSAGES.NO_EXPORT_DATA);
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
      const msg = logAndExtractMessage(error, "Failed to export data");
      toast({
        title: "Export Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetUpload = () => {
    setStatus(UploadStatus.Idle);
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
